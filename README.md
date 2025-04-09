# Vibe Coding Starter Pack: 3D Multiplayer

A lightweight 3D web-based multiplayer starter kit using Three.js, React, and SpacetimeDB. Perfect for building your own multiplayer games or interactive experiences with modern AI coding tools like Cursor.

## Project Structure

- `client/` - Frontend game client built with Three.js, React, and Vite
- `server/` - Backend SpacetimeDB module written in Rust

## Features

- **3D Multiplayer Foundation**: Connected players can see and interact with each other in real-time
- **Modern Tech Stack**: React, TypeScript, Three.js, SpacetimeDB, and Vite
- **Character System**: Basic movement and animations ready to customize
- **Multiplayer Support**: Server-authoritative design with client prediction
- **Debug Tools**: Built-in debug panel to monitor game state
- **Extensible**: Clean architecture designed for adding your own game mechanics
- **AI-Friendly**: Structured for effective use with AI coding assistants

## Getting Started

### Prerequisites

- Node.js and npm
- Rust and Cargo
- SpacetimeDB CLI

### Installation

Run the quick start script to set up everything:

```bash
sh setup.sh
```

Or install dependencies manually:

```bash
# Client
cd client
npm install

# Server
cd ../server
cargo build
```

### Development

Run both client and server in development mode:

```bash
# Terminal 1: Run the SpacetimeDB server
cd server
spacetime build
spacetime start
spacetime publish vibe-multiplayer

# Terminal 2: Run the client
cd client
npm run dev
```

This starts:
- SpacetimeDB server running locally
- Client on http://localhost:5173 (Vite dev server)

## Controls

- **W, A, S, D**: Move the player character
- **Shift**: Sprint
- **Space**: Jump 
- **Mouse**: Control camera direction

## Customization

This starter pack is designed to be easily customizable:

### Character Models

The included character models (Wizard & Paladin) can be:
1. Used as-is for a fantasy game
2. Replaced with your own models (vehicles, animals, robots, etc.)
3. Enhanced with additional animations

See `client/src/README_3D_MODELS.md` for details on working with the models.

### Game Mechanics

This starter provides the multiplayer foundation - now add your own game mechanics!

Ideas for expansion:
- Add combat systems
- Implement physics interactions
- Create collectible items
- Design levels and terrain
- Add vehicles or special movement modes
- Implement game-specific objectives

### Multiplayer Features

The starter pack includes:
- Player connection/disconnection handling
- Position and movement synchronization
- Player nametags
- Server-authoritative state management

## Development with AI Tools

This project is organized to work well with AI coding tools like Cursor:

1. Clear component separation makes it easy to describe changes
2. Modular architecture allows focused modifications
3. Type definitions help AI understand the codebase structure
4. Comments explain important technical patterns

## Technical Features

- SpacetimeDB for real-time multiplayer synchronization
- React and Three.js (via React Three Fiber) for 3D rendering
- TypeScript for type safety
- Character animation system
- Pointer lock controls for seamless camera movement
- Debug panel for monitoring state
- Player identification with custom usernames and colors
- Seamless player joining and leaving

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. You are free to use, modify, and distribute this code for any purpose, including commercial applications.

## Acknowledgments

This starter pack is maintained by Majid Manzarpour and is free to use for any project. 