# Crossing Quest 🐥

An original polish pass on a CodePen-based Three.js crossing game, retaining its original game loop, procedural forest / car / truck rows, grid movement and collision architecture.

## Features
- Colorful isometric 3D roads, trees, cars and trucks, with shadows and animated chicken
- Procedural endless lanes, grid-based hop movement, collisions and game-over / replay
- Arrow keys or WASD, on-screen directional buttons, and swipe gestures on the canvas
- Score and persistent local best score, pause/resume, responsive heads-up display
- Pure static site (no backend). External HTTPS dependency: Three.js via jsDelivr and Google Fonts (system fonts provide fallback). Internet access is required to fetch Three.js.

## Run locally
1. Extract the ZIP, retaining the folder structure.
2. In VS Code install Live Server, open `index.html`, and choose **Open with Live Server**. Alternatively run `python -m http.server 8000` in this directory and open http://localhost:8000.
3. Do not launch via `file://`, because browser module restrictions may apply.

## GitHub Pages
1. Create a public GitHub repository and upload **the contents** of this folder (so `index.html` is in the repo root).
2. Commit changes to `main`.
3. Open **Settings → Pages → Build and deployment**, set Source to **Deploy from a branch**, branch **main** and folder **/(root)**; save.
4. Visit `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` after deployment.

## Folder structure
- `index.html` — accessible game shell and HUD
- `css/style.css` — responsive layout
- `js/game.js` — original Three.js engine and improvements
- `assets/` — reserved for later original sounds or art (currently all 3D models are procedurally generated)

## Known limitations
- Three.js is loaded from a pinned CDN URL; the game cannot start without an internet connection unless that dependency is downloaded and locally vendored.
- Extensive endless play adds generated lanes to the scene; a future improvement is recycling off-screen rows.
- Automated 3D browser gameplay testing needs a browser with WebGL and access to the CDN.

## Credits
Built from the provided CodePen source; design and interaction upgrades based on the same game architecture.
