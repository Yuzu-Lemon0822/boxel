// display.js
// 描画担当モジュール
// ・scene
// ・camera
// ・renderer
// を管理し、render()を提供する

// ===== シーン作成 =====
// 3D空間そのもの
export const scene = new THREE.Scene();

// ===== ライト =====
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// ===== カメラ作成 =====
// PerspectiveCamera(視野角, アスペクト比, near, far)
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// ===== レンダラー作成 =====
// WebGLを使って描画する本体
export const renderer = new THREE.WebGLRenderer({
  antialias: true
});

// 画面サイズ設定
renderer.setSize(window.innerWidth, window.innerHeight);

// HTMLにcanvasを追加
document.body.appendChild(renderer.domElement);

// ===== 描画関数 =====
// main.jsから毎フレーム呼ばれる想定
export function render() {
  renderer.render(scene, camera);
}


// ===== リサイズ対応 =====
export function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  // カメラのアスペクト比を更新
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}