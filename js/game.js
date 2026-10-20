


import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const minTileIndex = -8;
const maxTileIndex = 8;
const tilesPerRow = maxTileIndex - minTileIndex + 1;
const tileSize = 42;

function Camera() {
  const size = 300;
  const viewRatio = window.innerWidth / window.innerHeight;
  const width = viewRatio < 1 ? size : size * viewRatio;
  const height = viewRatio < 1 ? size / viewRatio : size;

  const camera = new THREE.OrthographicCamera(
    width / -2, // left
    width / 2, // right
    height / 2, // top
    height / -2, // bottom
    100, // near
    900 // far
  );

  camera.up.set(0, 0, 1);
  camera.position.set(300, -300, 300);
  camera.lookAt(0, 0, 0);

  return camera;
}

function Texture(width, height, rects) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(0,0,0,0.6)";
  rects.forEach((rect) => {
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return new THREE.CanvasTexture(canvas);
}

const carFrontTexture = new Texture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = new Texture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = new Texture(110, 40, [
  { x: 10, y: 0, w: 50, h: 30 },
  { x: 70, y: 0, w: 30, h: 30 },
]);
const carLeftSideTexture = new Texture(110, 40, [
  { x: 10, y: 10, w: 50, h: 30 },
  { x: 70, y: 10, w: 30, h: 30 },
]);

export const truckFrontTexture = Texture(30, 30, [
  { x: 5, y: 0, w: 10, h: 30 },
]);
export const truckRightSideTexture = Texture(25, 30, [
  { x: 15, y: 5, w: 10, h: 10 },
]);
export const truckLeftSideTexture = Texture(25, 30, [
  { x: 15, y: 15, w: 10, h: 10 },
]);


function Car(initialTileIndex, direction, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * tileSize;
  if (!direction) car.rotation.z = Math.PI;

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(33, 24, 12), [
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carBackTexture,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carFrontTexture,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carRightSideTexture,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carLeftSideTexture,
    }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // top
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // bottom
  ]);
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const frontWheel = Wheel(18);
  car.add(frontWheel);

  const backWheel = Wheel(-18);
  car.add(backWheel);

  return car;
}

function DirectionalLight() {
  const dirLight = new THREE.DirectionalLight();
  dirLight.position.set(-100, -100, 200);
  dirLight.up.set(0, 0, 1);
  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  dirLight.shadow.camera.up.set(0, 0, 1);
  dirLight.shadow.camera.left = -400;
  dirLight.shadow.camera.right = 400;
  dirLight.shadow.camera.top = 400;
  dirLight.shadow.camera.bottom = -400;
  dirLight.shadow.camera.near = 50;
  dirLight.shadow.camera.far = 400;

  return dirLight;
}

function Grass(rowIndex) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * tileSize;

  const createSection = (color) =>
    new THREE.Mesh(
      new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
      new THREE.MeshLambertMaterial({ color })
    );

  const middle = createSection(0xbaf455);
  middle.receiveShadow = true;
  grass.add(middle);
  // Low-poly decorative flowers and ground accents are added to forest rows.

  const left = createSection(0x99c846);
  left.position.x = -tilesPerRow * tileSize;
  grass.add(left);

  const right = createSection(0x99c846);
  right.position.x = tilesPerRow * tileSize;
  grass.add(right);

  return grass;
}

const metadata = [];

const map = new THREE.Group();

function initializeMap() {
  // Remove all rows
  metadata.length = 0;
  map.remove(...map.children);

  // Add new rows
  for (let rowIndex = 0; rowIndex > -10; rowIndex--) {
    const grass = Grass(rowIndex);
    map.add(grass);
  }
  addRows();
}

function addRows() {
  const newMetadata = generateRows(20);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;

    if (rowData.type === "forest") {
      const row = Grass(rowIndex);

      rowData.trees.forEach(({ tileIndex, height }) => {
        const three = Tree(tileIndex, height);
        row.add(three);
      });

      map.add(row);
    }

    if (rowData.type === "car") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const car = Car(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = car;
        row.add(car);
      });

      map.add(row);
    }

    if (rowData.type === "truck") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const truck = Truck(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = truck;
        row.add(truck);
      });

      map.add(row);
    }
  });
}

const player = Player();

function Player() {
  const player = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  body.position.z = 10;
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);
  const beak = new THREE.Mesh(new THREE.BoxGeometry(10,7,6),new THREE.MeshLambertMaterial({color:0xffb22c}));
  beak.position.set(0,11,14);player.add(beak);
  for(const x of [-5,5]){
    const eye = new THREE.Mesh(new THREE.BoxGeometry(3.5,2,4),new THREE.MeshLambertMaterial({color:0x172b3c}));
    eye.position.set(x,8.5,19);player.add(eye);
  }
  const comb = new THREE.Mesh(new THREE.BoxGeometry(7,8,7),new THREE.MeshLambertMaterial({color:0xf35b6f}));
  comb.position.set(0,-2,23);player.add(comb);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 2),
    new THREE.MeshLambertMaterial({
      color: 0xf0619a,
      flatShading: true,
    })
  );
  cap.position.z = 21;
  cap.castShadow = true;
  cap.receiveShadow = true;
  player.add(cap);

  const playerContainer = new THREE.Group();
  playerContainer.add(player);

  return playerContainer;
}

const position = {
  currentRow: 0,
  currentTile: 0,
};

const movesQueue = [];

function initializePlayer() {
  // Initialize the Three.js player object
  player.position.x = 0;
  player.position.y = 0;
  player.children[0].position.z = 0;

  // Initialize metadata
  position.currentRow = 0;
  position.currentTile = 0;

  // Clear the moves queue
  movesQueue.length = 0;
}

function queueMove(direction) {
  const isValidMove = endsUpInValidPosition(
    {
      rowIndex: position.currentRow,
      tileIndex: position.currentTile,
    },
    [...movesQueue, direction]
  );

  if (!isValidMove) return;

  if (movesQueue.length < 3 && !gameOver && !paused) movesQueue.push(direction);
}

function stepCompleted() {
  const direction = movesQueue.shift();

  if (direction === "forward") position.currentRow += 1;
  if (direction === "backward") position.currentRow -= 1;
  if (direction === "left") position.currentTile -= 1;
  if (direction === "right") position.currentTile += 1;

  // Add new rows if the player is running out of them
  if (position.currentRow > metadata.length - 10) addRows();

  const scoreDOM = document.getElementById("score");
  if (position.currentRow > bestRun) { bestRun = position.currentRow; scoreDOM.textContent = bestRun.toString(); }
}

function Renderer() {
  const canvas = document.querySelector("canvas.game");
  if (!canvas) throw new Error("Canvas not found");

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return renderer;
}

function Road(rowIndex) {
  const road = new THREE.Group();
  road.position.y = rowIndex * tileSize;

  const createSection = (color) =>
    new THREE.Mesh(
      new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize),
      new THREE.MeshLambertMaterial({ color })
    );

  const middle = createSection(0x454a59);
  middle.receiveShadow = true;
  road.add(middle);
  const markingMaterial = new THREE.MeshLambertMaterial({color:0xffe7a3});
  for(let x=-tilesPerRow*tileSize/2+18;x<tilesPerRow*tileSize/2;x+=80){
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(28,2.5),markingMaterial);
    dash.position.set(x,0,0.11);road.add(dash);
  }

  const left = createSection(0x393d49);
  left.position.x = -tilesPerRow * tileSize;
  road.add(left);

  const right = createSection(0x393d49);
  right.position.x = tilesPerRow * tileSize;
  road.add(right);

  return road;
}

function Tree(tileIndex, height) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * tileSize;

  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: 0x4d2926,
      flatShading: true,
    })
  );
  trunk.position.z = 10;
  tree.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, height),
    new THREE.MeshLambertMaterial({
      color: randomElement([0x65ae49,0x4d9a61,0x8aca48]),
      flatShading: true,
    })
  );
  crown.position.z = height / 2 + 20;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.add(crown);
  const top = new THREE.Mesh(new THREE.BoxGeometry(23,23,9),new THREE.MeshLambertMaterial({color:0x9cdb6c}));
  top.position.z=height+19;top.castShadow=true;tree.add(top);

  return tree;
}

function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * tileSize;
  if (!direction) truck.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(70, 35, 35),
    new THREE.MeshLambertMaterial({
      color: 0xb4c6fc,
      flatShading: true,
    })
  );
  cargo.position.x = -15;
  cargo.position.z = 25;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), [
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      map: truckFrontTexture,
    }), // front
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
    }), // back
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      map: truckLeftSideTexture,
    }),
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      map: truckRightSideTexture,
    }),
    new THREE.MeshPhongMaterial({ color, flatShading: true }), // top
    new THREE.MeshPhongMaterial({ color, flatShading: true }), // bottom
  ]);
  cabin.position.x = 35;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;

  truck.add(cabin);

  const frontWheel = Wheel(37);
  truck.add(frontWheel);

  const middleWheel = Wheel(5);
  truck.add(middleWheel);

  const backWheel = Wheel(-35);
  truck.add(backWheel);

  return truck;
}

function Wheel(x) {
  const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({
      color: 0x333333,
      flatShading: true,
    })
  );
  wheel.position.x = x;
  wheel.position.z = 6;
  return wheel;
}

function calculateFinalPosition(currentPosition, moves) {
  return moves.reduce((position, direction) => {
    if (direction === "forward")
      return {
        rowIndex: position.rowIndex + 1,
        tileIndex: position.tileIndex,
      };
    if (direction === "backward")
      return {
        rowIndex: position.rowIndex - 1,
        tileIndex: position.tileIndex,
      };
    if (direction === "left")
      return {
        rowIndex: position.rowIndex,
        tileIndex: position.tileIndex - 1,
      };
    if (direction === "right")
      return {
        rowIndex: position.rowIndex,
        tileIndex: position.tileIndex + 1,
      };
    return position;
  }, currentPosition);
}

function endsUpInValidPosition(currentPosition, moves) {
  // Calculate where the player would end up after the move
  const finalPosition = calculateFinalPosition(currentPosition, moves);

  // Detect if we hit the edge of the board
  if (
    finalPosition.rowIndex === -1 ||
    finalPosition.tileIndex === minTileIndex - 1 ||
    finalPosition.tileIndex === maxTileIndex + 1
  ) {
    // Invalid move, ignore move command
    return false;
  }

  // Detect if we hit a tree
  const finalRow = metadata[finalPosition.rowIndex - 1];
  if (
    finalRow &&
    finalRow.type === "forest" &&
    finalRow.trees.some((tree) => tree.tileIndex === finalPosition.tileIndex)
  ) {
    // Invalid move, ignore move command
    return false;
  }

  return true;
}

function generateRows(amount) {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    const rowData = generateRow();
    rows.push(rowData);
  }
  return rows;
}

function generateRow() {
  const type = randomElement(["car", "truck", "forest", "forest"]);
  if (type === "car") return generateCarLaneMetadata();
  if (type === "truck") return generateTruckLaneMetadata();
  return generateForesMetadata();
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateForesMetadata() {
  const occupiedTiles = new Set();
  const trees = Array.from({ length: 4 }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    const height = randomElement([20, 45, 60]);

    return { tileIndex, height };
  });

  return { type: "forest", trees };
}

function generateCarLaneMetadata() {
  const direction = randomElement([true, false]);
  const speed = randomElement([90, 118, 146]);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: 3 }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);

    const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);

    return { initialTileIndex, color };
  });

  return { type: "car", direction, speed, vehicles };
}

function generateTruckLaneMetadata() {
  const direction = randomElement([true, false]);
  const speed = randomElement([90, 118, 146]);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: 2 }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 2);
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);
    occupiedTiles.add(initialTileIndex + 2);

    const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);

    return { initialTileIndex, color };
  });

  return { type: "truck", direction, speed, vehicles };
}

const moveClock = new THREE.Clock(false);

function animatePlayer() {
  if (!movesQueue.length) return;

  if (!moveClock.running) moveClock.start();

  const stepTime = 0.2; // Seconds it takes to take a step
  const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

  setPosition(progress);
  setRotation(progress);

  // Once a step has ended
  if (progress >= 1) {
    stepCompleted();
    moveClock.stop();
  }
}

function setPosition(progress) {
  const startX = position.currentTile * tileSize;
  const startY = position.currentRow * tileSize;
  let endX = startX;
  let endY = startY;

  if (movesQueue[0] === "left") endX -= tileSize;
  if (movesQueue[0] === "right") endX += tileSize;
  if (movesQueue[0] === "forward") endY += tileSize;
  if (movesQueue[0] === "backward") endY -= tileSize;

  player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
  player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
  player.children[0].position.z = Math.sin(progress * Math.PI) * 8;
}

function setRotation(progress) {
  let endRotation = 0;
  if (movesQueue[0] == "forward") endRotation = 0;
  if (movesQueue[0] == "left") endRotation = Math.PI / 2;
  if (movesQueue[0] == "right") endRotation = -Math.PI / 2;
  if (movesQueue[0] == "backward") endRotation = Math.PI;

  player.children[0].rotation.z = THREE.MathUtils.lerp(
    player.children[0].rotation.z,
    endRotation,
    progress
  );
}

const clock = new THREE.Clock();

function animateVehicles() {
  const delta = Math.min(clock.getDelta(),0.05);

  // Animate cars and trucks
  metadata.forEach((rowData) => {
    if (rowData.type === "car" || rowData.type === "truck") {
      const beginningOfRow = (minTileIndex - 2) * tileSize;
      const endOfRow = (maxTileIndex + 2) * tileSize;

      rowData.vehicles.forEach(({ ref }) => {
        if (!ref) throw Error("Vehicle reference is missing");

        if (rowData.direction) {
          ref.position.x =
            ref.position.x > endOfRow
              ? beginningOfRow
              : ref.position.x + rowData.speed * delta;
        } else {
          ref.position.x =
            ref.position.x < beginningOfRow
              ? endOfRow
              : ref.position.x - rowData.speed * delta;
        }
      });
    }
  });
}

document
  .getElementById("forward")
  ?.addEventListener("click", () => queueMove("forward"));

document
  .getElementById("backward")
  ?.addEventListener("click", () => queueMove("backward"));

document
  .getElementById("left")
  ?.addEventListener("click", () => queueMove("left"));

document
  .getElementById("right")
  ?.addEventListener("click", () => queueMove("right"));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("forward");
  } else if (event.key === "ArrowDown") {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("backward");
  } else if (event.key === "ArrowLeft") {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("left");
  } else if (event.key === "ArrowRight") {
    event.preventDefault(); // Avoid scrolling the page
    queueMove("right");
  }
});

const playerBox = new THREE.Box3();
const vehicleBox = new THREE.Box3();
function hitTest() {
  if (gameOver) return;
  // Check both current and adjacent rows while hopping to catch mid-step impacts.
  const center = player.position.y / tileSize;
  for (let rowNumber = Math.max(1,Math.floor(center)-1); rowNumber <= Math.ceil(center)+1;rowNumber++) {
    const row=metadata[rowNumber-1];
    if (!row || (row.type !== "car" && row.type !== "truck")) continue;
    playerBox.setFromObject(player);
    for (const {ref} of row.vehicles) {
      if (!ref) continue;
      vehicleBox.setFromObject(ref);
      if(playerBox.intersectsBox(vehicleBox)) {endGame();return;}
    }
  }
}
function endGame(){
  gameOver=true;
  movesQueue.length=0;
  const high=Math.max(bestRun,Number(localStorage.getItem("crossingQuestBest")||0));
  localStorage.setItem("crossingQuestBest",String(high));
  document.getElementById("best-score").textContent=String(high);
  document.getElementById("final-score").textContent=String(bestRun);
  resultDOM.classList.add("visible");
  document.getElementById("pause").disabled=true;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbbe9f5);
scene.fog = new THREE.Fog(0xbbe9f5,650,1300);
scene.add(player);
scene.add(map);

const ambientLight = new THREE.AmbientLight(0xffffff,1.25);
scene.add(ambientLight);

const dirLight = DirectionalLight();
dirLight.intensity=2;
dirLight.target = player;
player.add(dirLight);

const camera = Camera();
player.add(camera);

const scoreDOM = document.getElementById("score");
const resultDOM = document.getElementById("result-container");
const finalScoreDOM = document.getElementById("final-score");
let gameOver=false;
let paused=false;
let bestRun=0;

initializeGame();

document.querySelector("#retry")?.addEventListener("click", initializeGame);

function initializeGame() {
  document.getElementById("paused-overlay").classList.remove("visible");
  gameOver=false;paused=false;bestRun=0;moveClock.stop();clock.getDelta();
  initializePlayer();
  initializeMap();
  document.getElementById("pause").disabled=false;
  document.getElementById("pause").textContent="Ⅱ Pause";
  document.getElementById("best-score").textContent=String(Number(localStorage.getItem("crossingQuestBest")||0));

  // Initialize UI
  if (scoreDOM) scoreDOM.innerText = "0";
  if (resultDOM) resultDOM.classList.remove("visible");
}

const renderer = Renderer();
renderer.setAnimationLoop(animate);

function animate() {
  if (!gameOver && !paused) { animateVehicles();animatePlayer();hitTest(); }
  else clock.getDelta();

  renderer.render(scene, camera);
}

function resizeGame(){
  const ratio=innerWidth/innerHeight, size=300;
  const width=ratio<1?size:size*ratio, height=ratio<1?size/ratio:size;
  camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;
  camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
}
window.addEventListener("resize",resizeGame);
const controlsMap={w:"forward",s:"backward",a:"left",d:"right",ArrowUp:"forward",ArrowDown:"backward",ArrowLeft:"left",ArrowRight:"right"};
window.addEventListener("keydown",e=>{
 if(e.key === " " || e.key.toLowerCase()==="p"){e.preventDefault();togglePause();}
 if(e.key==="Enter"&&gameOver)initializeGame();
 if(controlsMap[e.key] && !e.repeat){e.preventDefault();if("wasd".includes(e.key))queueMove(controlsMap[e.key]);}
});
function togglePause(){if(gameOver)return;paused=!paused;if (paused) moveClock.stop();
 document.getElementById("pause").textContent=paused?"▶ Resume":"Ⅱ Pause";
 document.getElementById("paused-overlay").classList.toggle("visible",paused);
}
document.getElementById("pause").addEventListener("click",togglePause);
// Reset pause overlay independently from the original CodePen restart behavior.
document.getElementById("retry").addEventListener("click",()=>document.getElementById("paused-overlay").classList.remove("visible"));
let startTouch=null;
const gameCanvas=document.querySelector("canvas.game");
gameCanvas.addEventListener("touchstart",e=>{if(e.touches.length!==1)return;startTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
gameCanvas.addEventListener("touchend",e=>{
 if(!startTouch||!e.changedTouches.length)return;
 const dx=e.changedTouches[0].clientX-startTouch.x,dy=e.changedTouches[0].clientY-startTouch.y;
 startTouch=null;
 if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
 queueMove(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"backward":"forward"));
},{passive:true});
