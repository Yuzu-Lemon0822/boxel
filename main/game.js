import { camera } from "./display.js"
import { key } from "./input.js"

const player = {
  x = 0,
  y = 0,
  z = -5,
  rotX = 0,
  rotY = 0,
  powX = 0,
  powY = 0,
  powZ = 0,
  speed = 0.1,
  friction = 0.9,
  sensitive = 0.03
}

const yLimit = Math.PI()/2

function main() {
  if (key["KeyW"]) player.powZ += player.speed;
  if (key["KeyS"]) player.powZ -= player.speed;
  if (key["KeyD"]) player.powX += player.speed;
  if (key["KeyA"]) player.powX -= player.speed;
  if (key["KeyE"]) player.powY += player.speed;
  if (key["KeyQ"]) player.powY -= player.speed;
  player.powX *= player.friction;
  player.powY *= player.friction;
  player.powZ *= player.friction;
  player.x += player.powX;
  player.y += player.powY;
  player.z += player.powZ;

  if (key["ArrowUp"]) player.rotY += player.sensitive;
  if (key["ArrowDown"]) player.rotY -= player.sensitive;
  if (key["ArrowRight"]) player.rotX += player.sensitive;
  if (key["ArrowLeft"]) player.rotX -= player.sensitive;
  if (player.rotY > yLimit) player.rotY = yLimit;
  if (player.rotY < -yLimit) player.rotY = -yLimit;

  camera.position
}