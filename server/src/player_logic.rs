/**
 * Vibe Coding Starter Pack: 3D Multiplayer - player_logic.rs
 * 
 * This file contains the core movement and player state update logic.
 * It's separated from lib.rs to improve modularity and maintainability.
 * 
 * Key components:
 * 
 * 1. Movement Calculation:
 *    - calculate_new_position: Computes player movement based on grid coordinates
 *    - Instant teleportation to adjacent grid cells
 *    - Grid-based positioning system
 * 
 * 2. State Management:
 *    - update_input_state: Updates player state based on client input
 *    - Handles position, animation, and derived state (is_moving, is_running)
 *    - Translates raw input to game state
 * 
 * 3. Game Tick:
 *    - update_players_logic: Placeholder for periodic player updates
 *    - Currently empty as players are updated directly through input
 *    - Can be extended for server-side simulation (AI, physics, etc.)
 * 
 * Extension points:
 *    - Add terrain logic for different grid tiles
 *    - Implement server-side animation determination (commented example provided)
 *    - Add collision detection in calculate_new_position
 *    - Expand update_players_logic for server-side gameplay mechanics
 * 
 * Related files:
 *    - common.rs: Provides shared data types and constants
 *    - lib.rs: Calls into this module's functions from reducers
 */

use spacetimedb::ReducerContext;
// Import common structs and constants
use crate::common::{Vector3, InputState, PLAYER_SPEED, SPRINT_MULTIPLIER};
// Import the PlayerData struct definition (assuming it's in lib.rs or common.rs)
use crate::PlayerData;

// Grid cell size for movement
const GRID_CELL_SIZE: f32 = 1.0;

// Grid-based movement where players teleport one square at a time
pub fn calculate_new_position(position: &Vector3, rotation: &Vector3, input: &InputState, _delta_time: f32) -> Vector3 {
    let mut new_position = position.clone();
    
    // Determine primary movement direction based on input and rotation
    // We'll only allow one direction of movement at a time for grid-based movement
    
    // Get the dominant input direction based on player's facing
    // We need to determine which cardinal direction the player is primarily facing
    let yaw = rotation.y;
    let normalized_yaw = ((yaw % (2.0 * std::f32::consts::PI)) + 2.0 * std::f32::consts::PI) % (2.0 * std::f32::consts::PI);
    
    // Cardinal directions in radians (assuming standard orientation where 0 is +Z, and goes clockwise)
    // In Three.js: 0 radians = looking down negative Z axis
    // North = -Z, East = +X, South = +Z, West = -X
    
    if input.forward {
        // Move in the direction the player is facing (rounded to nearest cardinal)
        if normalized_yaw < std::f32::consts::PI * 0.25 || normalized_yaw > std::f32::consts::PI * 1.75 {
            // Facing primarily North (-Z)
            new_position.z -= GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 0.75 {
            // Facing primarily East (+X)
            new_position.x += GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 1.25 {
            // Facing primarily South (+Z)
            new_position.z += GRID_CELL_SIZE;
        } else {
            // Facing primarily West (-X)
            new_position.x -= GRID_CELL_SIZE;
        }
    } else if input.backward {
        // Move opposite to the direction the player is facing
        if normalized_yaw < std::f32::consts::PI * 0.25 || normalized_yaw > std::f32::consts::PI * 1.75 {
            // Facing primarily North, move South
            new_position.z += GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 0.75 {
            // Facing primarily East, move West
            new_position.x -= GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 1.25 {
            // Facing primarily South, move North
            new_position.z -= GRID_CELL_SIZE;
        } else {
            // Facing primarily West, move East
            new_position.x += GRID_CELL_SIZE;
        }
    } else if input.right {
        // Move 90 degrees clockwise from the direction the player is facing
        if normalized_yaw < std::f32::consts::PI * 0.25 || normalized_yaw > std::f32::consts::PI * 1.75 {
            // Facing primarily North, move East
            new_position.x += GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 0.75 {
            // Facing primarily East, move South
            new_position.z += GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 1.25 {
            // Facing primarily South, move West
            new_position.x -= GRID_CELL_SIZE;
        } else {
            // Facing primarily West, move North
            new_position.z -= GRID_CELL_SIZE;
        }
    } else if input.left {
        // Move 90 degrees counter-clockwise from the direction the player is facing
        if normalized_yaw < std::f32::consts::PI * 0.25 || normalized_yaw > std::f32::consts::PI * 1.75 {
            // Facing primarily North, move West
            new_position.x -= GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 0.75 {
            // Facing primarily East, move North
            new_position.z -= GRID_CELL_SIZE;
        } else if normalized_yaw < std::f32::consts::PI * 1.25 {
            // Facing primarily South, move East
            new_position.x += GRID_CELL_SIZE;
        } else {
            // Facing primarily West, move South
            new_position.z += GRID_CELL_SIZE;
        }
    }
    
    // Snap to grid
    new_position.x = (new_position.x / GRID_CELL_SIZE).round() * GRID_CELL_SIZE;
    new_position.z = (new_position.z / GRID_CELL_SIZE).round() * GRID_CELL_SIZE;
    
    return new_position;
}

// Note: Animation determination is currently handled client-side
// You could implement server-side animation logic here if needed
// For example:
// pub fn determine_animation(input: &InputState) -> String {
//     let is_moving = input.forward || input.backward || input.left || input.right;
//     if input.attack { return "attack1".to_string(); }
//     if input.jump { return "jump".to_string(); }
//     if is_moving {
//         if input.sprint { "run-forward".to_string() }
//         else { "walk-forward".to_string() }
//     } else {
//         "idle".to_string()
//     }
// }

// Update player state based on input
pub fn update_input_state(player: &mut PlayerData, input: InputState, client_rot: Vector3, client_animation: String) {
    // Calculate new grid position based on input
    let new_position = calculate_new_position(
        &player.position,
        &client_rot, // Use client rotation for direction calc
        &input,
        0.0 // Delta time not needed for grid movement
    );

    // Set is_teleporting flag to true to signal instant movement
    // This will need to be added to the PlayerData struct in lib.rs
    player.is_teleporting = true;
    
    // Update player state
    player.position = new_position;
    player.rotation = client_rot;
    player.current_animation = client_animation;
    player.input = input.clone(); // Store the input that caused this state
    player.last_input_seq = input.sequence;
    
    // Set is_moving to false since we're teleporting
    player.is_moving = false;
    player.is_running = false;
    
    player.is_attacking = input.attack;
    player.is_casting = input.cast_spell;
}

// Update players logic (called from game_tick)
pub fn update_players_logic(_ctx: &ReducerContext, _delta_time: f64) {
    // In the grid-based teleportation system, all movement is handled through keypresses
    // This function is a placeholder for future expansion (e.g., AI movement on grid)
}
