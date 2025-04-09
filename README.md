# Vibe Coding Starter Pack: 3D Multiplayer

A lightweight 3D web-based multiplayer starter kit using Three.js, React, and SpacetimeDB. Perfect for building your own multiplayer games or interactive experiences with modern AI coding tools like Cursor.

[Demo Video](https://x.com/majidmanzarpour/status/1909810088426021192)

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

First, clone the repository:

```bash
git clone https://github.com/majidmanzarpour/vibe-coding-starter-pack-3d-multiplayer
cd vibe-coding-starter-pack-3d-multiplayer
```

Then run the quick start script to set up everything automatically:

```bash
sh setup.sh
```

Or install dependencies manually with these steps:

```bash
# 1. Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 2. Add WASM target for Rust
rustup target add wasm32-unknown-unknown

# 3. Install Node.js via nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22

# 4. Install SpacetimeDB CLI
curl -sSf https://install.spacetimedb.com | sh

# Note: SpacetimeDB installs to ~/.local/bin - add it to your PATH if needed
export PATH="$HOME/.local/bin:$PATH"

# 5. Install client dependencies
cd client
npm install

# 6. Build server code
cd ../server
spacetime build

# 7. Generate TypeScript bindings
spacetime generate --lang typescript --out-dir ../client/src/generated
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

When making changes to the server schema or reducers, regenerate TypeScript bindings:

```bash
# From the server directory
spacetime generate --lang typescript --out-dir ../client/src/generated
```

This starts:
- SpacetimeDB server running locally
- Client on http://localhost:5173 (Vite dev server)

## About SpacetimeDB

This project is built on [SpacetimeDB](https://spacetimedb.com), a distributed database and serverless application framework specifically designed for multiplayer games and real-time applications. SpacetimeDB provides:

- **Real-time Synchronization**: Automatically sync database changes to connected clients
- **TypeScript Client Generation**: Generate type-safe client bindings from your Rust server code
- **Seamless Deployment**: Easily deploy your game server to the cloud
- **Game-Oriented Architecture**: Built with multiplayer game patterns in mind

SpacetimeDB handles the complex networking, state synchronization, and persistence layers so you can focus on building your game logic.

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

This starter pack is maintained by [Majid Manzarpour](https://x.com/majidmanzarpour) and is free to use for any project. 
