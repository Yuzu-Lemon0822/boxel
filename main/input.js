export const pointer = new Map();
export const key = {}

function set(Id, x, y) {
  pointer.set(Id, {x: x, y: y})
}

window.addEventListener("pointerdown", e => {
  set(e.pointerId, e.clientX, e.clientY)
});

window.addEventListener("pointermove", e => {
  set(e.pointerId, e.clientX, e.clientY)
});

window.addEventListener("pointerup", e => {
  pointer.delete(e.pointerId)
});

window.addEventListener("keydown", e => {
  key[e.code] = true;
});

window.addEventListener("keyup", e => {
  key[e.code] = false;
});