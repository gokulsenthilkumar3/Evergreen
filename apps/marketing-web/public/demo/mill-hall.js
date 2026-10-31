// Original low-poly study: 60 positions, 2,880 triangles, one draw call.
export function createMillHall(canvas, inspect, lost) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders = [];
  const shader = (type, source) => {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS))
      throw new Error("Shader unavailable");
    shaders.push(item);
    return item;
  };
  const program = gl.createProgram();
  gl.attachShader(
    program,
    shader(
      gl.VERTEX_SHADER,
      `attribute vec3 p;attribute vec3 c;uniform float drift;varying vec3 color;void main(){float x=p.x*cos(drift)-p.z*sin(drift);float z=p.x*sin(drift)+p.z*cos(drift);gl_Position=vec4((x-z)*0.064,(x+z)*0.025+p.y*0.15-0.12,(x+z)*0.018-p.y*0.03,1.);color=c;}`,
    ),
  );
  gl.attachShader(
    program,
    shader(
      gl.FRAGMENT_SHADER,
      `precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.);}`,
    ),
  );
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error("Program unavailable");
  const data = [],
    centers = [];
  for (let i = 0; i < 60; i++) {
    const x = ((i % 15) - 7) * 0.9,
      z = (Math.floor(i / 15) - 1.5) * 2.1;
    centers.push([x, z]);
    for (let side = 0; side < 12; side++) {
      const a = (side * Math.PI) / 6,
        b = ((side + 1) * Math.PI) / 6;
      const points = [
        [x + Math.cos(a) * 0.32, 0, z + Math.sin(a) * 0.32],
        [x + Math.cos(b) * 0.32, 0, z + Math.sin(b) * 0.32],
        [x + Math.cos(a) * 0.18, 1.25, z + Math.sin(a) * 0.18],
        [x + Math.cos(b) * 0.18, 1.25, z + Math.sin(b) * 0.18],
      ];
      const light = 0.65 + 0.3 * Math.max(0, Math.cos(a - 0.7));
      for (const index of [0, 1, 2, 1, 3, 2])
        data.push(...points[index], 0.22 * light, 0.34 * light, 0.44 * light);
      data.push(
        ...points[2],
        0.54,
        0.55,
        0.47,
        ...points[3],
        0.54,
        0.55,
        0.47,
        x,
        1.25,
        z,
        0.54,
        0.55,
        0.47,
      );
      data.push(
        ...points[0],
        0.22,
        0.25,
        0.25,
        x,
        0,
        z,
        0.22,
        0.25,
        0.25,
        ...points[1],
        0.22,
        0.25,
        0.25,
      );
    }
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.useProgram(program);
  for (const [name, offset] of [
    ["p", 0],
    ["c", 12],
  ]) {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, offset);
  }
  const driftLocation = gl.getUniformLocation(program, "drift");
  let frame = 0,
    running = false,
    disposed = false,
    last = 0,
    drift = 0;
  function draw() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect(),
      scale = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(bounds.width * scale)),
      h = Math.max(1, Math.round(bounds.height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.91, 0.875, 0.796, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.uniform1f(driftLocation, drift);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
  }
  function tick(time) {
    if (!running || disposed) return;
    if (time - last >= 1000 / 30) {
      last = time;
      drift = Math.sin(time / 16000) * 0.035;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function setRunning(value) {
    if (disposed || running === value) return;
    running = value;
    if (value) frame = requestAnimationFrame(tick);
    else cancelAnimationFrame(frame);
  }
  function pick(event) {
    const bounds = canvas.getBoundingClientRect(),
      px = ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      py = 1 - ((event.clientY - bounds.top) / bounds.height) * 2;
    let nearest = -1,
      distance = 0.014;
    centers.forEach(([cx, cz], index) => {
      const x = cx * Math.cos(drift) - cz * Math.sin(drift),
        z = cx * Math.sin(drift) + cz * Math.cos(drift),
        d = (px - (x - z) * 0.064) ** 2 + (py - ((x + z) * 0.025 + 0.07)) ** 2;
      if (d < distance) {
        distance = d;
        nearest = index;
      }
    });
    if (nearest >= 0) inspect(nearest);
  }
  function onLost(event) {
    event.preventDefault();
    lost();
  }
  canvas.addEventListener("click", pick);
  canvas.addEventListener("webglcontextlost", onLost);
  window.addEventListener("resize", draw);
  return {
    draw,
    setRunning,
    select() {
      draw();
    },
    dispose() {
      if (disposed) return;
      setRunning(false);
      disposed = true;
      canvas.removeEventListener("click", pick);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("resize", draw);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((item) => gl.deleteShader(item));
    },
  };
}
