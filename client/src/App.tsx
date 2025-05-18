/**
 * Vibe Coding Starter Pack: 3D Multiplayer - App.tsx
 * 
 * Main application component that orchestrates the entire multiplayer experience.
 * This file serves as the central hub for:
 * 
 * 1. SpacetimeDB Connection Management:
 *    - Establishes and maintains WebSocket connection
 *    - Handles authentication and identity
 *    - Subscribes to database tables
 *    - Processes real-time updates
 * 
 * 2. Player Input Handling:
 *    - Keyboard and mouse event listeners
 *    - Input state tracking and normalization
 *    - Animation state determination
 *    - Camera/rotation management with pointer lock
 * 
 * 3. Game Loop:
 *    - Sends player input to server at appropriate intervals
 *    - Updates local state based on server responses
 *    - Manages the requestAnimationFrame cycle
 * 
 * 4. UI Management:
 *    - Renders GameScene (3D view)
 *    - Controls DebugPanel visibility
 *    - Manages JoinGameDialog for player registration
 *    - Displays connection status
 * 
 * Extension points:
 *    - Add new input types in currentInputRef and InputState
 *    - Extend determineAnimation for new animation states
 *    - Add new reducers calls for game features (see handleCastSpellInput)
 *    - Modify game loop timing or prediction logic
 * 
 * Related files:
 *    - components/GameScene.tsx: 3D rendering with Three.js
 *    - components/Player.tsx: Character model and animation
 *    - components/DebugPanel.tsx: Developer tools and state inspection
 *    - generated/: Auto-generated TypeScript bindings from the server
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import { Identity } from '@clockworklabs/spacetimedb-sdk';
import * as moduleBindings from './generated';
import { DebugPanel } from './components/DebugPanel';
import { GameScene } from './components/GameScene';
import { JoinGameDialog } from './components/JoinGameDialog';
import * as THREE from 'three';
import { PlayerUI } from './components/PlayerUI';

// Type Aliases
type DbConnection = moduleBindings.DbConnection;
type EventContext = moduleBindings.EventContext;
type ErrorContext = moduleBindings.ErrorContext;
type PlayerData = moduleBindings.PlayerData;
type InputState = moduleBindings.InputState;
// ... other types ...

let conn: DbConnection | null = null;

// Add a global declaration to make the connection available to other components
declare global {
  var conn: moduleBindings.DbConnection | null;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [statusMessage, setStatusMessage] = useState("Connecting...");
  const [players, setPlayers] = useState<ReadonlyMap<string, PlayerData>>(new Map());
  const [localPlayer, setLocalPlayer] = useState<PlayerData | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isDebugPanelExpanded, setIsDebugPanelExpanded] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false); // State for pointer lock status

  // --- Ref for current input state ---
  const currentInputRef = useRef<InputState>({
    forward: false, backward: false, left: false, right: false,
    sprint: false, jump: false, attack: false, castSpell: false,
    sequence: 0,
  });
  const lastSentInputState = useRef<Partial<InputState>>({});
  const animationFrameIdRef = useRef<number | null>(null); // For game loop

  // New import for handling player rotation data
  const playerRotationRef = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0, 'YXZ'));

  // --- Moved Table Callbacks/Subscription Functions Up ---
  const registerTableCallbacks = useCallback(() => {
    if (!conn) return;
    console.log("Registering table callbacks...");

    conn.db.player.onInsert((_ctx: EventContext, player: PlayerData) => {
        console.log("Player inserted (callback):", player.identity.toHexString());
        setPlayers((prev: ReadonlyMap<string, PlayerData>) => new Map(prev).set(player.identity.toHexString(), player));
        if (identity && player.identity.toHexString() === identity.toHexString()) {
            setLocalPlayer(player);
            setStatusMessage(`Registered as ${player.username}`);
        }
    });

    conn.db.player.onUpdate((_ctx: EventContext, _oldPlayer: PlayerData, newPlayer: PlayerData) => {
        setPlayers((prev: ReadonlyMap<string, PlayerData>) => {
            const newMap = new Map(prev);
            newMap.set(newPlayer.identity.toHexString(), newPlayer);
            return newMap;
        });
        if (identity && newPlayer.identity.toHexString() === identity.toHexString()) {
            setLocalPlayer(newPlayer);
        }
    });

    conn.db.player.onDelete((_ctx: EventContext, player: PlayerData) => {
        console.log("Player deleted (callback):", player.identity.toHexString());
        setPlayers((prev: ReadonlyMap<string, PlayerData>) => {
            const newMap = new Map(prev);
            newMap.delete(player.identity.toHexString());
            return newMap;
        });
        if (identity && player.identity.toHexString() === identity.toHexString()) {
            setLocalPlayer(null);
            setStatusMessage("Local player deleted!");
        }
    });
    console.log("Table callbacks registered.");
  }, [identity]); // Keep identity dependency

  const onSubscriptionApplied = useCallback(() => {
     console.log("Subscription applied successfully.");
     setPlayers((prev: ReadonlyMap<string, PlayerData>) => {
         if (prev.size === 0 && conn) {
             const currentPlayers = new Map<string, PlayerData>();
             for (const player of conn.db.player.iter()) {
                 currentPlayers.set(player.identity.toHexString(), player);
                 if (identity && player.identity.toHexString() === identity.toHexString()) {
                     setLocalPlayer(player);
                 }
             }
             return currentPlayers;
         }
         return prev;
     });
  }, [identity]); // Keep identity dependency

  const onSubscriptionError = useCallback((error: any) => {
      console.error("Subscription error:", error);
      setStatusMessage(`Subscription Error: ${error?.message || error}`);
  }, []);

  const subscribeToTables = useCallback(() => {
    if (!conn) return;
    console.log("Subscribing to tables...");
    const subscription = conn.subscriptionBuilder();
    subscription.subscribe("SELECT * FROM player");
    subscription.subscribe("SELECT * FROM grid_square");
    subscription.onApplied(onSubscriptionApplied);
    subscription.onError(onSubscriptionError);
  }, [identity, onSubscriptionApplied, onSubscriptionError]); // Add dependencies

  // --- Event Handlers ---
  const handleDelegatedClick = useCallback((event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('.interactive-button');
      if (button) {
          event.preventDefault();
          console.log(`[CLIENT] Button click detected: ${button.getAttribute('data-action')}`);
          // Generic button handler without specific attack functionality
      }
  }, []);

  // --- Input State Management ---
  const keyMap: { [key: string]: keyof Omit<InputState, 'sequence'> } = {
      KeyW: 'forward', KeyS: 'backward', KeyA: 'left', KeyD: 'right',
      ShiftLeft: 'sprint', Space: 'jump', KeyC: 'castSpell'
  };

  const determineAnimation = useCallback((input: InputState): string => {
    if (input.attack) return 'attack1';
    if (input.castSpell) return 'cast';
    if (input.jump) return 'jump';
    
    // Determine animation based on movement keys
    const { forward, backward, left, right, sprint } = input;
    const isMoving = forward || backward || left || right;
    
    if (!isMoving) return 'idle';
    
    // Improved direction determination with priority handling
    // This matches legacy implementation better
    let direction = 'forward';
    
    // Primary direction determination - match legacy player.js logic
    if (forward && !backward) {
      direction = 'forward';
    } else if (backward && !forward) {
      direction = 'back';
    } else if (left && !right) {
      direction = 'left';
    } else if (right && !left) {
      direction = 'right';
    } else if (forward && left) {
      // Handle diagonal movement by choosing dominant direction
      direction = 'left';
    } else if (forward && right) {
      direction = 'right'; 
    } else if (backward && left) {
      direction = 'left';
    } else if (backward && right) {
      direction = 'right';
    }
    
    // Choose movement type based on sprint state
    const moveType = sprint ? 'run' : 'walk';
    
    // Generate final animation name
    const animationName = `${moveType}-${direction}`;
    
    return animationName;
  }, []);

  const sendInput = useCallback((input: InputState) => {
    // For flying mode, we don't send updates to the server
    // This is a no-op now - all movement is handled client-side only
    return;
    
    // Original code:
    /* 
    if (!conn || !identity) return;
    const currentState = {...input};
    
    // Skip sending if no change since last sent state
    if (deepEqual(currentState, lastSentInputState.current)) {
        return;
    }
    
    // Save the state we're about to send for comparison next time
    lastSentInputState.current = {...currentState};
    
    // Only send if we have a valid rotation
    if (!playerRotationRef.current) return;

    // Get player position from state or default to 0,0,0
    const currentPos = localPlayer?.position || { x: 0, y: 0, z: 0 };
    
    try {
        // Detect frame drops or lag
        const highseq = input.sequence > 1000000; // Arbitrary high number
        if (highseq) {
            console.log(`High sequence detected: ${input.sequence}, resetting to 1`);
            currentInputRef.current.sequence = 1;
        }
        
        // Animation determination
        const animationName = determineAnimation(input);
        
        // Update server with current input, position, rotation, and animation
        conn.reducers.updatePlayerInput(
            input, 
            currentPos,
            { 
                x: playerRotationRef.current.x,
                y: playerRotationRef.current.y,
                z: playerRotationRef.current.z
            },
            animationName
        );
    } catch (error) {
        console.error("Error sending input to server:", error);
    }
    */
  }, []);

  // Add player rotation handler
  const handlePlayerRotation = useCallback((rotation: THREE.Euler) => {
    // Update our stored rotation whenever the player rotates (from mouse movements)
    playerRotationRef.current.copy(rotation);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (event.repeat) return; 
      const action = keyMap[event.code];
      if (action) {
          if (!currentInputRef.current[action]) { 
             currentInputRef.current[action] = true;
          }
      }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
      const action = keyMap[event.code];
      if (action) {
          if (currentInputRef.current[action]) { 
              currentInputRef.current[action] = false;
          }
      }
  }, []);

  const handleMouseDown = useCallback((event: MouseEvent) => {
      if (event.button === 0) { 
           if (!currentInputRef.current.attack) {
               currentInputRef.current.attack = true;
           }
      }
  }, []);

  const handleMouseUp = useCallback((event: MouseEvent) => {
      if (event.button === 0) { 
           if (currentInputRef.current.attack) {
               currentInputRef.current.attack = false;
           }
      }
  }, []);

  // Add mouse move handler with pointer lock for rotation
  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Only rotate if we have pointer lock
    if (document.pointerLockElement === document.body) {
      const sensitivity = 0.002;
      // Update the Euler rotation with mouse movement
      playerRotationRef.current.y -= event.movementX * sensitivity;
      
      // Clamp vertical rotation (looking up/down) to prevent flipping
      playerRotationRef.current.x = Math.max(
        -Math.PI / 2.5, 
        Math.min(Math.PI / 2.5, playerRotationRef.current.x - event.movementY * sensitivity)
      );
    }
  }, []);

  // --- Listener Setup/Removal Functions ---
  const handlePointerLockChange = useCallback(() => {
    setIsPointerLocked(document.pointerLockElement === document.body);
    console.log("Pointer Lock Changed: ", document.pointerLockElement === document.body);
  }, []);

  const setupInputListeners = useCallback(() => {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove); // Add mouse move listener
      document.addEventListener('pointerlockchange', handlePointerLockChange); // Listen for lock changes
      console.log("Input listeners added.");
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, handleMouseMove, handlePointerLockChange]);

  const removeInputListeners = useCallback(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove); // Remove mouse move listener
      document.removeEventListener('pointerlockchange', handlePointerLockChange); // Remove listener
      console.log("Input listeners removed.");
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, handleMouseMove, handlePointerLockChange]);

  const setupDelegatedListeners = useCallback(() => {
      document.body.addEventListener('click', handleDelegatedClick, true);
      console.log("Delegated listener added to body.");
  }, [handleDelegatedClick]);

  const removeDelegatedListeners = useCallback(() => {
      document.body.removeEventListener('click', handleDelegatedClick, true);
      console.log("Delegated listener removed from body.");
  }, [handleDelegatedClick]);

  // --- Game Loop Effect ---
  useEffect(() => {
      const gameLoop = () => {
          if (!connected || !conn || !identity) {
              if (animationFrameIdRef.current) {
                  cancelAnimationFrame(animationFrameIdRef.current);
                  animationFrameIdRef.current = null;
              }
              return;
          }
          currentInputRef.current.sequence += 1;
          sendInput(currentInputRef.current);
          animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      };

      if (connected && !animationFrameIdRef.current) {
          console.log("[CLIENT] Starting game loop.");
          animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      }

      return () => {
          if (animationFrameIdRef.current) {
              console.log("[CLIENT] Stopping game loop.");
              cancelAnimationFrame(animationFrameIdRef.current);
              animationFrameIdRef.current = null;
          }
      };
  }, [connected, conn, identity, sendInput]);

  // --- Connection Effect Hook ---
  useEffect(() => {
    console.log("Running Connection Effect Hook...");
    if (conn) {
        console.log("Connection already established, skipping setup.");
         if (connected) {
             setupInputListeners();
             setupDelegatedListeners();
         }
        return;
    }

    const dbHost = "maincloud.spacetimedb.com";
    const dbName = "promptandconquer";

    console.log(`Connecting to SpacetimeDB at ${dbHost}, database: ${dbName}...`);

    const onConnect = (connection: DbConnection, id: Identity, _token: string) => {
      console.log("Connected!");
      conn = connection;
      window.conn = connection; // Store connection in global window object
      setIdentity(id);
      setConnected(true);
      setStatusMessage(`Connected as ${id.toHexString().substring(0, 8)}...`);
      subscribeToTables();
      registerTableCallbacks();
      setupInputListeners();
      setupDelegatedListeners();
      setShowJoinDialog(true);
    };

    const onDisconnect = (_ctx: ErrorContext, reason?: Error | null) => {
      const reasonStr = reason ? reason.message : "No reason given";
      console.log("onDisconnect triggered:", reasonStr);
      setStatusMessage(`Disconnected: ${reasonStr}`);
      conn = null;
      window.conn = null; // Clear global connection reference
      setIdentity(null);
      setConnected(false);
      setPlayers(new Map());
      setLocalPlayer(null);
    };

    moduleBindings.DbConnection.builder()
      .withUri(`wss://${dbHost}`)
      .withModuleName(dbName)
      .onConnect(onConnect)
      .onDisconnect(onDisconnect)
      .build();

    return () => {
      console.log("Cleaning up connection effect - removing listeners.");
      removeInputListeners();
      removeDelegatedListeners();
    };
  }, []);

  // --- handleJoinGame ---
  const handleJoinGame = (username: string, characterClass: string) => {
    if (!conn) {
        console.error("Cannot join game, not connected.");
        return;
    }
    console.log(`Registering as ${username} (${characterClass})...`);
    conn.reducers.registerPlayer(username, characterClass);
    setShowJoinDialog(false);
  };

  // --- Render Logic ---
  return (
    <div className="App" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showJoinDialog && <JoinGameDialog onJoin={handleJoinGame} />}
      
      {/* Conditionally render DebugPanel based on connection status */} 
      {/* Visibility controlled internally, expansion controlled by state */}
      {connected && (
          <DebugPanel 
            statusMessage={statusMessage}
            localPlayer={localPlayer}
            identity={identity}
            playerMap={players}
            expanded={isDebugPanelExpanded}
            onToggleExpanded={() => setIsDebugPanelExpanded((prev: boolean) => !prev)}
            isPointerLocked={isPointerLocked} // Pass pointer lock state down
          />
      )}

      {/* Always render GameScene and PlayerUI when connected */} 
      {connected && (
        <>
          <GameScene 
            players={players} 
            localPlayerIdentity={identity} 
            onPlayerRotation={handlePlayerRotation}
            currentInputRef={currentInputRef}
            isDebugPanelVisible={isDebugPanelExpanded}
          />
          {/* Render PlayerUI only if localPlayer exists */} 
          {localPlayer && <PlayerUI playerData={localPlayer} />} 
          
          {/* Flying Controls Explanation */}
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            right: '20px', 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Flying Controls:</h3>
            <p style={{ margin: '5px 0' }}>WASD: Move horizontally</p>
            <p style={{ margin: '5px 0' }}>SPACE: Fly up</p>
            <p style={{ margin: '5px 0' }}>C: Fly down</p>
            <p style={{ margin: '5px 0' }}>SHIFT: Move faster</p>
            <p style={{ margin: '5px 0' }}>MOUSE: Look around</p>
          </div>
        </>
      )}

      {/* Show status when not connected */} 
      {!connected && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><h1>{statusMessage}</h1></div>
      )}
    </div>
  );
}

export default App;
