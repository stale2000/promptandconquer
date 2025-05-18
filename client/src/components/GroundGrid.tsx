import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import * as moduleBindings from '../generated';

type GridSquareData = moduleBindings.GridSquareData;

// Global reference to the SpacetimeDB connection
declare global {
  var conn: moduleBindings.DbConnection | null;
}

interface GroundGridProps {
  size?: number;         // Size of each square
  gap?: number;          // Gap between squares
  rows?: number;         // Number of rows
  columns?: number;      // Number of columns
  centerGrid?: boolean;  // Whether to center the grid at origin
  color?: string;        // Default color of squares
  alternateColors?: boolean; // Whether to use alternating colors
  secondColor?: string;  // Second color for alternating pattern
  elevation?: number;    // Height off the ground
  height?: number;       // Height of each raised square
  textureUrl?: string;   // Optional texture URL
  roughness?: number;    // Material roughness
  metalness?: number;    // Material metalness
  opacity?: number;      // Material opacity
  selectedColor?: string; // Color for selected squares
}

export const GroundGrid: React.FC<GroundGridProps> = ({
  size = 2,              // Default square size - roughly player size
  gap = 0.2,             // Small gap between squares
  rows = 20,             // 20x20 grid by default
  columns = 20,
  centerGrid = true,     // Center the grid at origin by default
  color = '#1a5fb4',     // Default color
  alternateColors = true,
  secondColor = '#99c1f1',
  elevation = 0,         // At ground level by default
  height = 0.05,         // Default raised height
  textureUrl,
  roughness = 0.7,       // Default roughness (less reflective)
  metalness = 0.1,       // Default metalness (slightly metallic)
  opacity = 1.0,         // Fully opaque by default
  selectedColor = '#ffcc00' // Yellow color for selected squares
}) => {
  // State to track which squares have been selected from the server
  const [selectedSquares, setSelectedSquares] = useState<Set<string>>(new Set());
  
  // Load texture if provided
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
  
  // Calculate total grid dimensions
  const totalWidth = columns * size + (columns - 1) * gap;
  const totalDepth = rows * size + (rows - 1) * gap;
  
  // Calculate offset to center the grid if needed
  const offsetX = centerGrid ? -totalWidth / 2 : 0;
  const offsetZ = centerGrid ? -totalDepth / 2 : 0;
  
  // Subscribe to grid_square table updates
  useEffect(() => {
    // Skip if connection isn't available
    if (!window.conn) return;
    
    console.log("Setting up grid square subscription and callbacks");
    
    // Register callbacks for grid square table changes
    window.conn.db.gridSquare.onInsert((_ctx, square: GridSquareData) => {
      if (square.selected) {
        setSelectedSquares(prev => {
          const newSet = new Set(prev);
          newSet.add(square.key);
          return newSet;
        });
      }
    });
    
    window.conn.db.gridSquare.onUpdate((_ctx, _oldSquare: GridSquareData, newSquare: GridSquareData) => {
      setSelectedSquares(prev => {
        const newSet = new Set(prev);
        if (newSquare.selected) {
          newSet.add(newSquare.key);
        } else {
          newSet.delete(newSquare.key);
        }
        return newSet;
      });
    });
    
    window.conn.db.gridSquare.onDelete((_ctx, square: GridSquareData) => {
      setSelectedSquares(prev => {
        const newSet = new Set(prev);
        newSet.delete(square.key);
        return newSet;
      });
    });
    
    // Subscribe to the grid_square table
    const subscription = window.conn.subscriptionBuilder();
    subscription.subscribe("SELECT * FROM grid_square");
    subscription.onApplied(() => {
      console.log("Grid square subscription applied");
      // Initialize selected squares from the current data
      if (window.conn) {
        const initialSelected = new Set<string>();
        for (const square of window.conn.db.gridSquare.iter()) {
          if (square.selected) {
            initialSelected.add(square.key);
          }
        }
        setSelectedSquares(initialSelected);
      }
    });
    subscription.onError((error) => {
      console.error("Grid square subscription error:", error);
    });
    
    return () => {
      // Cleanup - when the component unmounts, we can't unsubscribe but
      // at least we can remove the callbacks to prevent memory leaks
      if (window.conn) {
        // Remove callbacks (if the SDK supports this)
        // This is a placeholder - check if the SDK has a way to unregister callbacks
      }
    };
  }, []);
  
  // Handle click on a square
  const handleClick = (key: string) => {
    if (!window.conn) {
      console.error("Cannot toggle grid square - not connected to server");
      return;
    }
    
    console.log("Toggling grid square:", key);
    try {
      // Call the reducer to toggle the square on the server
      window.conn.reducers.toggleGridSquare(key);
    } catch (error) {
      console.error("Error toggling grid square:", error);
    }
  };
  
  // Generate squares
  const squares = useMemo(() => {
    const squaresArray = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Calculate position - y coordinate is now elevation + half of height
        const x = offsetX + col * (size + gap) + size / 2;
        const y = elevation + height / 2; // Position at half the height for box geometry
        const z = offsetZ + row * (size + gap) + size / 2;
        
        // Determine color (alternating pattern if enabled)
        const isAlternate = (row + col) % 2 === 1;
        const squareColor = alternateColors && isAlternate ? secondColor : color;
        const key = `square-${row}-${col}`;
        
        squaresArray.push({
          position: [x, y, z],
          color: squareColor,
          key
        });
      }
    }
    
    return squaresArray;
  }, [rows, columns, size, gap, offsetX, offsetZ, color, secondColor, alternateColors, elevation, height]);
  
  return (
    <group>
      {squares.map((square) => (
        <mesh 
          key={square.key} 
          position={square.position as [number, number, number]} 
          castShadow  // Cast shadows
          receiveShadow // Enable shadow receiving
          onClick={(e) => {
            console.log("Click detected on grid square:", square.key);
            e.stopPropagation();
            if (e.nativeEvent) {
              e.nativeEvent.stopPropagation();
              e.nativeEvent.preventDefault();
            }
            // Prevent camera controls from being activated
            if (e.delta) e.delta = 0; // Reset any movement delta
            handleClick(square.key);
          }}
          onPointerDown={(e) => {
            // Capture pointer to prevent camera controls
            console.log("Pointer down on grid square:", square.key);
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            console.log("Pointer up on grid square:", square.key);
            e.stopPropagation();
          }}
        >
          <boxGeometry args={[size, height, size]} />
          {texture ? (
            <meshStandardMaterial 
              map={texture} 
              color={selectedSquares.has(square.key) ? selectedColor : square.color} 
              roughness={roughness}
              metalness={metalness}
              opacity={opacity}
              transparent={opacity < 1}
            />
          ) : (
            <meshStandardMaterial 
              color={selectedSquares.has(square.key) ? selectedColor : square.color} 
              roughness={roughness}
              metalness={metalness}
              opacity={opacity}
              transparent={opacity < 1}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}; 