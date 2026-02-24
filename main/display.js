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

function box(pos, size, opts = {}) {

  const {
    color = 0xffffff,
    material = null,

    rightFace = true,
    leftFace = true,
    topFace = true,
    bottomFace = true,
    frontFace = true,
    backFace = true
  } = opts;

  const geometry = new THREE.BufferGeometry();

  const vertices = [];
  const normals = [];
  const indices = [];

  let indexOffset = 0;

  const addFace = (v, normal) => {

    vertices.push(...v);

    for (let i = 0; i < 4; i++) {
      normals.push(...normal);
    }

    indices.push(
      indexOffset, indexOffset+1, indexOffset+2,
      indexOffset, indexOffset+2, indexOffset+3
    );

    indexOffset += 4;
  };

  const [x, y, z] = pos;
  const [sx, sy, sz] = size;

  const x0 = x,       x1 = x + sx;
  const y0 = y,       y1 = y + sy;
  const z0 = z,       z1 = z + sz;

  // 外側から見てCCW

  if (frontFace) {
    addFace([
      x0,y0,z1,
      x1,y0,z1,
      x1,y1,z1,
      x0,y1,z1
    ], [0,0,1]);
  }

  if (backFace) {
    addFace([
      x1,y0,z0,
      x0,y0,z0,
      x0,y1,z0,
      x1,y1,z0
    ], [0,0,-1]);
  }

  if (rightFace) {
    addFace([
      x1,y0,z1,
      x1,y0,z0,
      x1,y1,z0,
      x1,y1,z1
    ], [1,0,0]);
  }

  if (leftFace) {
    addFace([
      x0,y0,z0,
      x0,y0,z1,
      x0,y1,z1,
      x0,y1,z0
    ], [-1,0,0]);
  }

  if (topFace) {
    addFace([
      x0,y1,z1,
      x1,y1,z1,
      x1,y1,z0,
      x0,y1,z0
    ], [0,1,0]);
  }

  if (bottomFace) {
    addFace([
      x0,y0,z0,
      x1,y0,z0,
      x1,y0,z1,
      x0,y0,z1
    ], [0,-1,0]);
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertices), 3)
  );

  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(normals), 3)
  );

  geometry.setIndex(indices);

  const mat = material ?? new THREE.MeshStandardMaterial({ color });

  return new THREE.Mesh(geometry, mat);
}

const cube = box(
  [0, 0, 0],
  [1, 1, 1],
  {
    color: 0x00ff00,
    backFace: false
  }
);

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