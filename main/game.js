import { camera } from "./display.js"
import { key } from "./input.js"

camera.rotation.order = "YXZ"

const player = {
  x: 0,
  y: 0,
  z: 5,

  yaw: 0,    // 左右
  pitch: 0,  // 上下

  powX: 0,
  powY: 0,
  powZ: 0,

  speed: 0.02,
  friction: 0.9,
  sensitive: 0.05
}

const pitchLimit = Math.PI / 2 - 0.01

export function main() {

  // ===== 移動入力 =====
  if (key["KeyW"]) player.powZ -= player.speed;
  if (key["KeyS"]) player.powZ += player.speed;
  if (key["KeyD"]) player.powX += player.speed;
  if (key["KeyA"]) player.powX -= player.speed;
  if (key["KeyE"]) player.powY += player.speed;
  if (key["KeyQ"]) player.powY -= player.speed;

  // 摩擦
  player.powX *= player.friction;
  player.powY *= player.friction;
  player.powZ *= player.friction;

  // ===== 回転入力 =====
  if (key["ArrowLeft"])  player.yaw += player.sensitive;
  if (key["ArrowRight"]) player.yaw -= player.sensitive;
  if (key["ArrowUp"])    player.pitch += player.sensitive;
  if (key["ArrowDown"])  player.pitch -= player.sensitive;

  // ピッチ制限
  player.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, player.pitch));

  // ===== ワールド移動計算 =====
  player.x += player.powZ * Math.sin(player.yaw) + player.powX * Math.cos(player.yaw);

  player.z += player.powZ * Math.cos(player.yaw) - player.powX * Math.sin(player.yaw);

  player.y += player.powY;

  // ===== カメラ反映 =====
  camera.position.set(player.x, player.y, player.z);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}
