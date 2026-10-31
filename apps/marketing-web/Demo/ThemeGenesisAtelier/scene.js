export function createYarnScene(canvas, controls) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { refresh() {}, destroy() {} };
  canvas.parentElement.classList.add('canvas-ready');
  let width=640,height=540,frame=0,last=0,clock=0,visible=true,dead=false;
  let targetX=0,targetY=0,tiltX=0,tiltY=0,mouseVelX=0,mouseVelY=0,lastMouseX=0,lastMouseY=0;
  let ringsCount=58,segmentsPerRing=64,drawTotal=0,drawCount=0;
  const threadColors = [
    '#1a3321', 
    '#2c4f34', 
    '#446f48', 
    '#62945d', 
    '#8bbd78', 
    '#b4df8b', 
    '#d6f79e', 
    '#fffce0', 
  ];
  const particles = Array.from({ length: 48 }, (_, i) => ({
    x: (Math.random() - 0.5) * 360,
    y: (Math.random() - 0.5) * 380,
    z: (Math.random() - 0.5) * 200,
    vx: (Math.random() - 0.5) * 0.4,
    vy: Math.random() * 0.6 + 0.2,
    vz: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.8 + 0.8,
    alpha: Math.random() * 0.7 + 0.3,
    hue: Math.random() > 0.3 ? '#d3ec9a' : '#ffd778',
    seed: i * 1.618,
  }));
  function project(x, y, z, rotY, rotX) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const fov = 920;
    const perspective = fov / (fov - z2);
    const scale = Math.min(width / 600, height / 520);
    return [
      width * 0.52 + x1 * perspective * scale,
      height * 0.50 + y1 * perspective * scale,
      z2,
      perspective,
    ];
  }
  function draw() {
    const started = performance.now();
    ctx.clearRect(0, 0, width, height);
    const progress = (controls.progress ? controls.progress() : 0) / 100;
    const legacyMode = controls.isLegacy ? controls.isLegacy() : false;
    const morph = Math.max(0, Math.min(1, (progress - 0.15) / 0.7));
    const smoothMorph = morph * morph * (3 - 2 * morph);
    const baseAngle = clock * 0.08 + tiltX * 0.45;
    const baseTilt = -0.18 + tiltY * 0.22;
    const glowX = width * 0.52 + tiltX * 180;
    const glowY = height * 0.50 + tiltY * 140;
    const auraGrad = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, 320);
    if (legacyMode) {
      auraGrad.addColorStop(0, 'rgba(230, 80, 50, 0.18)');
      auraGrad.addColorStop(0.5, 'rgba(180, 50, 30, 0.08)');
      auraGrad.addColorStop(1, 'transparent');
    } else {
      auraGrad.addColorStop(0, 'rgba(211, 236, 154, 0.22)');
      auraGrad.addColorStop(0.4, 'rgba(80, 150, 90, 0.12)');
      auraGrad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, width, height);
    const buckets = threadColors.map(() => []);
    for (let ring = 0; ring < ringsCount; ring++) {
      const v = ring / (ringsCount - 1); 
      const coneRadius = 45 + v * 125;
      const coneY = -180 + v * 340;
      let priorPoint = null;
      for (let seg = 0; seg <= segmentsPerRing; seg++) {
        const u = seg / segmentsPerRing;
        const theta = u * Math.PI * 2 + v * 2.2 + clock * 0.1;
        const cx = Math.cos(theta) * coneRadius;
        const cy = coneY + Math.sin(u * 14 + clock * 0.5) * 3;
        const cz = Math.sin(theta) * coneRadius;
        const wx = (u - 0.5) * 480;
        const wy = (v - 0.5) * 340;
        const wz = Math.sin(u * Math.PI * 6 + v * 8 + clock * 0.3) * 12;
        const x = cx * (1 - smoothMorph) + wx * smoothMorph;
        const y = cy * (1 - smoothMorph) + wy * smoothMorph;
        const z = cz * (1 - smoothMorph) + wz * smoothMorph;
        const p = project(x, y, z, baseAngle * (1 - smoothMorph * 0.7), baseTilt + smoothMorph * 0.3);
        if (priorPoint) {
          const depthNorm = Math.max(0, Math.min(7, Math.floor((p[2] + 200) / 50)));
          buckets[depthNorm].push(priorPoint[0], priorPoint[1], p[0], p[1]);
        }
        priorPoint = p;
      }
    }
    ctx.lineWidth = Math.max(0.7, width / 720);
    for (let i = 0; i < buckets.length; i++) {
      const lines = buckets[i];
      if (lines.length === 0) continue;
      ctx.beginPath();
      ctx.strokeStyle = legacyMode && i > 4 ? '#e86a52' : threadColors[i];
      for (let j = 0; j < lines.length; j += 4) {
        ctx.moveTo(lines[j], lines[j + 1]);
        ctx.lineTo(lines[j + 2], lines[j + 3]);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = legacyMode ? 0.2 : 0.45;
    ctx.strokeStyle = legacyMode ? '#ff8e7b' : '#eaf8cf';
    ctx.lineWidth = 0.6;
    for (let strand = 0; strand < 26; strand++) {
      ctx.beginPath();
      for (let seg = 0; seg <= 42; seg++) {
        const v = seg / 42;
        const u = strand / 25;
        const theta = u * Math.PI * 2 + v * 2.2;
        const r = 45 + v * 125;
        const cx = Math.cos(theta) * r;
        const cy = -180 + v * 340;
        const cz = Math.sin(theta) * r;
        const wx = (u - 0.5) * 480;
        const wy = (v - 0.5) * 340;
        const wz = Math.sin(u * 16 + v * 8 + clock * 0.3) * 10;
        const p = project(
          cx * (1 - smoothMorph) + wx * smoothMorph,
          cy * (1 - smoothMorph) + wy * smoothMorph,
          cz * (1 - smoothMorph) + wz * smoothMorph,
          baseAngle * (1 - smoothMorph * 0.7),
          baseTilt + smoothMorph * 0.3
        );
        if (seg === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const threadOrigin = project(0, -180, 0, baseAngle, baseTilt);
    const threadBase = project(70, 160, 60, baseAngle, baseTilt);
    const unspoolProgress = Math.min(1, progress * 1.4);
    ctx.save();
    ctx.strokeStyle = legacyMode ? '#ff5238' : '#d4ec96';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = legacyMode ? '#ff5238' : '#d4ec96';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(threadBase[0], threadBase[1]);
    const cp1x = threadBase[0] + 60 + Math.sin(clock * 2) * 20;
    const cp1y = threadBase[1] + 40;
    const cp2x = width * 0.75 + Math.cos(clock * 1.5) * 30;
    const cp2y = height * 0.82;
    const endX = width * (0.4 + unspoolProgress * 0.6);
    const endY = height * 0.92;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
    ctx.restore();
    for (const pt of particles) {
      pt.y += pt.vy;
      pt.x += pt.vx + mouseVelX * 0.5;
      pt.z += pt.vz;
      if (pt.y > 220) pt.y = -200;
      if (pt.x > 260) pt.x = -260;
      if (pt.x < -260) pt.x = 260;
      const p = project(pt.x, pt.y, pt.z, baseAngle * 0.5, baseTilt);
      const pulse = Math.sin(clock * 2 + pt.seed) * 0.3 + 0.7;
      ctx.fillStyle = legacyMode ? '#ff8366' : pt.hue;
      ctx.globalAlpha = pt.alpha * pulse * Math.max(0.1, 1 - p[2] / 400);
      ctx.beginPath();
      ctx.arc(p[0], p[1], pt.size * p[3], 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawCount++;
    drawTotal += performance.now() - started;
    if (drawCount === 40 && drawTotal / drawCount > 11) {
      ringsCount = 38;
      segmentsPerRing = 48;
    }
    canvas.dataset.renderDetail = `${ringsCount}x${segmentsPerRing}`;
    if (drawCount % 30 === 0) {
      canvas.dataset.averageDrawMs = (drawTotal / drawCount).toFixed(2);
    }
  }
  function canAnimate() {
    return !dead && visible && !document.hidden && (!controls.paused || !controls.paused());
  }
  function tick(now) {
    frame = 0;
    if (!canAnimate()) {
      last = 0;
      return;
    }
    if (!last) last = now;
    const delta = now - last;
    if (delta >= 16) {
      const elapsed = Math.min(delta, 64);
      last = now;
      clock += elapsed / 1000;
      tiltX += (targetX - tiltX) * 0.08;
      tiltY += (targetY - tiltY) * 0.08;
      mouseVelX *= 0.92;
      mouseVelY *= 0.92;
      if (controls.advance) controls.advance(elapsed);
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    if (dead) return;
    draw();
    if (canAnimate() && !frame) {
      frame = requestAnimationFrame(tick);
    } else if (!canAnimate() && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    refresh();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      refresh();
    },
    { threshold: 0.02 }
  );
  intersection.observe(canvas);
  const pointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseVelX = nx - lastMouseX;
    mouseVelY = ny - lastMouseY;
    lastMouseX = nx;
    lastMouseY = ny;
    targetX = nx;
    targetY = ny;
    if (controls.paused && controls.paused()) {
      tiltX = targetX;
      tiltY = targetY;
      refresh();
    }
  };
  const reset = () => {
    targetX = 0;
    targetY = 0;
  };
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', refresh);
  resize();
  return {
    refresh,
    destroy() {
      dead = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      canvas.removeEventListener('pointermove', pointer);
      canvas.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', refresh);
    },
  };
}