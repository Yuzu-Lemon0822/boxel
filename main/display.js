// display.js
// 描画担当モジュール
// ・scene
// ・camera
// ・renderer
// を管理し、render()を提供する

// ===== シーン作成 =====
// 3D空間そのもの
export const scene = new THREE.Scene();


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


// ===== 立方体作成 =====

// 形状（幅・高さ・奥行）
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 法線方向で色が変わるマテリアル（立体感確認用）
const material = new THREE.MeshNormalMaterial();

// geometry + material を合体させた描画オブジェクト
const cube = new THREE.Mesh(geometry, material);

// シーンに追加（これしないと表示されない）
scene.add(cube);


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