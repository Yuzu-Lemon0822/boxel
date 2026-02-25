// ===== data.js =====

// =========================
// 基本設定
// =========================
export const CHUNK_SIZE = 16;
const seed = 192319241989;

// world = チャンク単位Map
export const world = new Map();

// メッシュ生成予約キュー
export const meshTasks = [];

// =========================
// ユーティリティ
// =========================
function chunkKey(cx, cy, cz) {
  return `${cx}|${cy}|${cz}`;
}

// =========================
// Hash（0〜1）
// =========================
function Hash(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647 + seed;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function lerp(t) {
  return t * t * (3 - 2 * t);
}

function noise(x, y, z) {
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  const cz = Math.floor(z);

  const fx = x - cx;
  const fy = y - cy;
  const fz = z - cz;

  const w000 = Hash(cx, cy, cz);
  const w001 = Hash(cx, cy, cz + 1);
  const w010 = Hash(cx, cy + 1, cz);
  const w011 = Hash(cx, cy + 1, cz + 1);
  const w100 = Hash(cx + 1, cy, cz);
  const w101 = Hash(cx + 1, cy, cz + 1);
  const w110 = Hash(cx + 1, cy + 1, cz);
  const w111 = Hash(cx + 1, cy + 1, cz + 1);

  const w00 = w000 + (w001 - w000) * lerp(fz);
  const w01 = w010 + (w011 - w010) * lerp(fz);
  const w10 = w100 + (w101 - w100) * lerp(fz);
  const w11 = w110 + (w111 - w110) * lerp(fz);

  const w0 = w00 + (w01 - w00) * lerp(fy);
  const w1 = w10 + (w11 - w10) * lerp(fy);

  return w0 + (w1 - w0) * lerp(fx);
}

function fbm(x, y, z) {
  let value = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;

  for (let i = 0; i < 3; i++) {
    value += noise(x * freq, y * freq, z * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }

  return value / norm;
}

// =========================
// チャンク生成
// =========================
export function generateChunk(cx, cy, cz) {

  const key = chunkKey(cx, cy, cz);
  if (world.has(key)) return;

  const data = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);

  const scale = 0.05;
  const threshold = 0.5;

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {

        const wx = cx * CHUNK_SIZE + x;
        const wy = cy * CHUNK_SIZE + y;
        const wz = cz * CHUNK_SIZE + z;

        const density = fbm(wx * scale, wy * scale, wz * scale);

        const index =
          x +
          y * CHUNK_SIZE +
          z * CHUNK_SIZE * CHUNK_SIZE;

        data[index] = density > threshold ? 1 : 0;
      }
    }
  }

  world.set(key, {
    cx, cy, cz,
    data,
    dirty: true
  });

  meshTasks.push([cx, cy, cz]);
}

// =========================
// ワールド座標からVoxel取得
// =========================
export function getVoxel(wx, wy, wz) {

  const cx = Math.floor(wx / CHUNK_SIZE);
  const cy = Math.floor(wy / CHUNK_SIZE);
  const cz = Math.floor(wz / CHUNK_SIZE);

  const chunk = world.get(chunkKey(cx, cy, cz));
  if (!chunk) return 0;

  const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

  const index =
    lx +
    ly * CHUNK_SIZE +
    lz * CHUNK_SIZE * CHUNK_SIZE;

  return chunk.data[index];
}

// =========================
// メッシュ用データ生成（チャンク跨ぎ対応）
// THREEは使わない
// =========================
export function buildChunkMeshData(cx, cy, cz) {

  const chunk = world.get(chunkKey(cx, cy, cz));
  if (!chunk) return null;

  const positions = [];
  const normals = [];
  const indices = [];

  let indexOffset = 0;

  const dirs = [
    [ 1, 0, 0],
    [-1, 0, 0],
    [ 0, 1, 0],
    [ 0,-1, 0],
    [ 0, 0, 1],
    [ 0, 0,-1],
  ];

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {

        const index =
          x +
          y * CHUNK_SIZE +
          z * CHUNK_SIZE * CHUNK_SIZE;

        if (!chunk.data[index]) continue;

        const wx = cx * CHUNK_SIZE + x;
        const wy = cy * CHUNK_SIZE + y;
        const wz = cz * CHUNK_SIZE + z;

        for (const [dx, dy, dz] of dirs) {

          if (getVoxel(wx + dx, wy + dy, wz + dz)) continue;

          const x0 = wx;
          const x1 = wx + 1;
          const y0 = wy;
          const y1 = wy + 1;
          const z0 = wz;
          const z1 = wz + 1;

          const face = getFace(x0, x1, y0, y1, z0, z1, dx, dy, dz);
          if (!face) continue;

          positions.push(...face.vertices);

          for (let i = 0; i < 4; i++) {
            normals.push(dx, dy, dz);
          }

          indices.push(
            indexOffset,
            indexOffset + 1,
            indexOffset + 2,
            indexOffset,
            indexOffset + 2,
            indexOffset + 3
          );

          indexOffset += 4;
        }
      }
    }
  }

  chunk.dirty = false;

  return { positions, normals, indices };
}

function getFace(x0,x1,y0,y1,z0,z1,dx,dy,dz) {

  if (dx === 1) return { vertices: [
    x1,y0,z0, x1,y0,z1, x1,y1,z1, x1,y1,z0
  ]};

  if (dx === -1) return { vertices: [
    x0,y0,z1, x0,y0,z0, x0,y1,z0, x0,y1,z1
  ]};

  if (dy === 1) return { vertices: [
    x0,y1,z1, x1,y1,z1, x1,y1,z0, x0,y1,z0
  ]};

  if (dy === -1) return { vertices: [
    x0,y0,z0, x1,y0,z0, x1,y0,z1, x0,y0,z1
  ]};

  if (dz === 1) return { vertices: [
    x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1
  ]};

  if (dz === -1) return { vertices: [
    x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0
  ]};

  return null;
}