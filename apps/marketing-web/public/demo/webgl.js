/* Optional procedural asset. No model download, texture, library or network access. */
const vertexSource = `attribute vec3 aPosition; attribute vec3 aNormal;
uniform mat4 uMvp; uniform mat4 uModel;
varying vec3 vNormal; varying vec3 vLocal; varying vec3 vWorld;
void main(){vNormal=mat3(uModel)*aNormal; vLocal=aPosition; vWorld=(uModel*vec4(aPosition,1.0)).xyz; gl_Position=uMvp*vec4(aPosition,1.0);}`;
const fragmentSource = `precision mediump float;
varying vec3 vNormal; varying vec3 vLocal; varying vec3 vWorld;
uniform vec3 uColor; uniform float uThread;
void main(){
 vec3 n=normalize(vNormal); vec3 light=normalize(vec3(-0.65,0.85,1.2));
 float diffuse=max(dot(n,light),0.0); float rim=pow(1.0-max(dot(n,vec3(0.,0.,1.)),0.0),2.6);
 float winding=sin(vLocal.y*176.0+atan(vLocal.z,vLocal.x)*3.0);
 float crossing=sin(vLocal.y*86.0-atan(vLocal.z,vLocal.x)*2.0);
 float texture=1.0-uThread*(0.08+0.11*step(0.3,winding)+0.04*crossing);
 float sheen=pow(max(dot(reflect(-light,n),normalize(vec3(0.0,0.5,5.0)-vWorld)),0.0),32.0);
 vec3 color=uColor*(0.28+diffuse*0.78)*texture + vec3(0.20,0.19,0.13)*rim + vec3(0.20)*sheen;
 gl_FragColor=vec4(color,1.0);
}`;

function identity(out) {
  out.fill(0);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}
function multiply(out, a, b) {
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
  return out;
}
function rotation(out, axis, value) {
  identity(out);
  const c = Math.cos(value),
    s = Math.sin(value);
  if (axis === "x") {
    out[5] = c;
    out[6] = s;
    out[9] = -s;
    out[10] = c;
  }
  if (axis === "y") {
    out[0] = c;
    out[2] = -s;
    out[8] = s;
    out[10] = c;
  }
  if (axis === "z") {
    out[0] = c;
    out[1] = s;
    out[4] = -s;
    out[5] = c;
  }
}
function geometry() {
  const data = [];
  const groups = [];
  const segments = 112;
  const vertex = (x, y, z, nx, ny, nz) => data.push(x, y, z, nx, ny, nz);
  const surface = (y0, y1, r0, r1, color, thread) => {
    const first = data.length / 6;
    const slope = (r0 - r1) / (y1 - y0);
    const length = Math.hypot(1, slope);
    for (let j = 0; j < 12; j++)
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2,
          b = ((i + 1) / segments) * Math.PI * 2;
        const ya = y0 + ((y1 - y0) * j) / 12,
          yb = y0 + ((y1 - y0) * (j + 1)) / 12,
          ra = r0 + ((r1 - r0) * j) / 12,
          rb = r0 + ((r1 - r0) * (j + 1)) / 12;
        for (const [theta, y, r] of [
          [a, ya, ra],
          [b, ya, ra],
          [b, yb, rb],
          [a, ya, ra],
          [b, yb, rb],
          [a, yb, rb],
        ])
          vertex(
            Math.cos(theta) * r,
            y,
            Math.sin(theta) * r,
            Math.cos(theta) / length,
            slope / length,
            Math.sin(theta) / length,
          );
      }
    groups.push({ first, count: data.length / 6 - first, color, thread });
  };
  const ring = (y, outer, inner, sign, color) => {
    const first = data.length / 6;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2,
        b = ((i + 1) / segments) * Math.PI * 2;
      for (const [theta, r] of [
        [a, inner],
        [a, outer],
        [b, outer],
        [a, inner],
        [b, outer],
        [b, inner],
      ])
        vertex(Math.cos(theta) * r, y, Math.sin(theta) * r, 0, sign, 0);
    }
    groups.push({ first, count: data.length / 6 - first, color, thread: 0 });
  };
  surface(-1.4, 1.4, 1.17, 0.8, [0.66, 0.7, 0.51], 1);
  surface(-1.49, -1.4, 1.29, 1.29, [0.54, 0.57, 0.39], 0);
  ring(-1.4, 1.29, 0.16, 1, [0.67, 0.66, 0.48]);
  ring(-1.49, 1.29, 0.16, -1, [0.32, 0.4, 0.27]);
  surface(1.4, 1.49, 0.94, 0.94, [0.61, 0.64, 0.44], 0);
  ring(1.49, 0.94, 0.16, 1, [0.76, 0.74, 0.55]);
  ring(1.4, 0.94, 0.16, -1, [0.38, 0.45, 0.29]);
  surface(1.49, 1.58, 0.16, 0.16, [0.32, 0.37, 0.23], 0);
  ring(1.58, 0.16, 0.105, 1, [0.74, 0.68, 0.48]);
  surface(1.35, 1.58, 0.105, 0.105, [0.055, 0.075, 0.045], 0);
  return { vertices: new Float32Array(data), groups };
}

export function createSpool(canvas, onLost) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  if (!gl) throw new Error("WebGL unavailable");
  const resources = [];
  const shader = (kind, source) => {
    const value = gl.createShader(kind);
    if (!value) throw new Error("Shader unavailable");
    gl.shaderSource(value, source);
    gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) {
      gl.deleteShader(value);
      throw new Error("Shader compilation failed");
    }
    resources.push(value);
    return value;
  };
  const program = gl.createProgram();
  if (!program) throw new Error("Program unavailable");
  try {
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Program linking failed");
  } catch (error) {
    resources.forEach((value) => gl.deleteShader(value));
    gl.deleteProgram(program);
    throw error;
  }
  resources.forEach((value) => gl.deleteShader(value));
  const mesh = geometry();
  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    throw new Error("Buffer unavailable");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "aPosition"),
    normal = gl.getAttribLocation(program, "aNormal");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(normal);
  gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
  const mvpUniform = gl.getUniformLocation(program, "uMvp"),
    modelUniform = gl.getUniformLocation(program, "uModel"),
    colorUniform = gl.getUniformLocation(program, "uColor"),
    threadUniform = gl.getUniformLocation(program, "uThread");
  const projection = new Float32Array(16),
    view = new Float32Array(16),
    x = new Float32Array(16),
    y = new Float32Array(16),
    z = new Float32Array(16),
    scratch = new Float32Array(16),
    model = new Float32Array(16),
    mv = new Float32Array(16),
    mvp = new Float32Array(16);
  identity(view);
  view[14] = -6.65;
  let frame = 0,
    running = false,
    disposed = false,
    lost = false,
    angle = 0.65,
    last = 0,
    pointerX = 0,
    pointerY = 0,
    targetX = 0,
    targetY = 0;
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  function resize() {
    if (disposed || lost) return;
    const bounds = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    canvas.height = Math.max(1, Math.round(bounds.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    projection.fill(0);
    const f = 1 / Math.tan((37 * Math.PI) / 360);
    projection[0] = f / (canvas.width / canvas.height);
    projection[5] = f;
    projection[10] = -(100 + 0.1) / (100 - 0.1);
    projection[11] = -1;
    projection[14] = (-2 * 100 * 0.1) / (100 - 0.1);
    draw();
  }
  function draw() {
    if (disposed || lost) return;
    pointerX += (targetX - pointerX) * 0.065;
    pointerY += (targetY - pointerY) * 0.065;
    rotation(x, "x", 0.13 + pointerY * 0.12);
    rotation(y, "y", angle + pointerX * 0.2);
    rotation(z, "z", -0.25);
    multiply(scratch, z, x);
    multiply(model, scratch, y);
    multiply(mv, view, model);
    multiply(mvp, projection, mv);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(mvpUniform, false, mvp);
    gl.uniformMatrix4fv(modelUniform, false, model);
    for (const group of mesh.groups) {
      gl.uniform3f(colorUniform, ...group.color);
      gl.uniform1f(threadUniform, group.thread);
      gl.drawArrays(gl.TRIANGLES, group.first, group.count);
    }
  }
  function tick(time) {
    if (!running || disposed || lost) {
      frame = 0;
      return;
    }
    const delta = last ? Math.min(0.05, (time - last) / 1000) : 0;
    last = time;
    angle += delta * 0.09;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function setRunning(value) {
    running = !!value && !disposed && !lost;
    if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }
  const observer =
    "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  observer?.observe(canvas.parentElement);
  if (!observer) window.addEventListener("resize", resize);
  function contextLost(event) {
    event.preventDefault();
    lost = true;
    setRunning(false);
    onLost();
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  resize();
  return {
    draw,
    setRunning,
    setPointer(px, py) {
      targetX = Math.max(-0.5, Math.min(0.5, px));
      targetY = Math.max(-0.5, Math.min(0.5, py));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      setRunning(false);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", contextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
