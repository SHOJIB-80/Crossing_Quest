# Crossing Quest

A browser-based 3D cross-the-road arcade game where the player controls a chicken character across moving traffic and forest lanes while trying to survive as long as possible and beat the best score.

## Overview

This project is a static front-end game built with HTML, CSS, and JavaScript. The game uses Three.js to render an isometric 3D scene with roads, moving vehicles, trees, lighting, shadows, and a responsive HUD. Players move through a procedurally generated grid of lanes, avoid incoming cars and trucks, and continue as long as they can stay clear of obstacles.

The project is designed as a single-page arcade experience with no backend, no database, and no server-side processing. The game state, including the local best score, is stored in the browser using `localStorage`.

## Features

- Isometric 3D road and forest environment
- Procedural generation of road and forest rows
- Moving cars and trucks with alternating directions
- Player movement using keyboard input, on-screen controls, and touch gestures
- Pause and resume gameplay
- Score tracking and persistent best score
- Game-over screen with retry option
- Responsive canvas layout for different screen sizes
- Pure static front-end architecture

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML | Game shell and HUD structure |
| CSS | Layout, responsive styling, and interface design |
| JavaScript | Game logic, rendering, input handling, and animation |
| Three.js | 3D scene rendering, lighting, objects, and animation |
| LocalStorage | Best score persistence in the browser |

## Project Structure

```text
Crossing_Quest/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── game.js
├── README.md
```

### Key Files

- `index.html` — main game file that loads the canvas and UI elements
- `css/style.css` — styling for the page, HUD, controls, overlays, and responsive layout
- `js/game.js` — core game logic, 3D generation, player movement, collision detection, and animation loop

## System Architecture

```text
User
  ↓
Browser UI
  ↓
JavaScript Game Logic
  ↓
Three.js Rendering Engine
  ↓
Canvas / WebGL Scene
```

The application runs entirely in the browser. The JavaScript file creates the 3D scene, generates rows, animates vehicles, handles player movement, checks for collisions, and updates the score and result overlays.

## Installation

1. Clone the repository to your local machine.
2. Open the project directory in a browser-compatible local web server environment.
3. Start a local server from the project root:

```bash
python -m http.server 8000
```

4. Open the following URL in the browser:

```text
http://localhost:8000
```

The project can also be opened with VS Code Live Server or any other local static file server.

## Configuration

This project does not include a backend configuration file or environment variables. The main dependency is the Three.js module, which is loaded from a CDN in the project code:

```javascript
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
```

Because of this, an internet connection is required for the game to load the Three.js library unless the dependency is vendored locally.

## Running the Project

1. Place the repository files in a web-accessible folder or local development environment.
2. Start a local static server.
3. Open the game in the browser.
4. Use the keyboard or touch controls to move the chicken across the lanes.

## Controls

The application supports the following controls:

- Arrow keys: move the player
- WASD keys: move the player
- On-screen directional buttons: mobile and desktop interaction
- Touch swipe gestures: directional movement on touch devices
- Space or P: pause and resume the game

## Gameplay

The player begins on the starting lane and moves across a grid-based board. Each row is generated as either a road with moving vehicles or a forest segment with trees. The game checks both movement validity and collision detection as the player advances.

The score increases with successful forward progress, and the best score is stored in the browser for future runs. If the player collides with a vehicle, the game ends and the result overlay is shown.

## Live Preview

This project is prepared for deployment as a static web application. Add the live preview or hosted URL here once the project is published.

## Testing

This repository does not include an automated test suite or test scripts. The project is primarily a front-end game and is validated through browser interaction.

## Known Limitations

- The game depends on the Three.js CDN for rendering.
- The road and forest generation is designed as an endless arcade loop and may grow continuously during long runs.
- There is no backend service, multiplayer mode, or persistent server-side leaderboard.
- The application is static and does not include database-backed user accounts or data persistence beyond browser local storage.

## License

This repository does not currently include a license file.
Licence under SHOJIB-80
## Author

MD Sirajul Islam

## Credits

This project is a browser-based Three.js arcade game with custom styling and gameplay logic developed for this repository. The implementation is centered around a procedural lane-crossing mechanic adapted for a modern static web experience.
