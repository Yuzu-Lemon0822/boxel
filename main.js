import { render, resize } from "./main/display.js";
import { main as gameMain } from "./main/game.js";

// リサイズ対応
window.addEventListener("resize", resize);
resize(); // 初期サイズ調整

let lastTime = 0;

function loop(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // ゲーム更新
  gameMain(delta);

  // 描画
  render();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);