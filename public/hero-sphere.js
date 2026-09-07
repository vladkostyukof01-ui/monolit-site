// Интерактивная 3D-сфера из юридических терминов — вращается вслед за курсором.
// Классическая техника "3D tag cloud": термины распределены по сфере
// (fibonacci sphere), при движении мыши сфера вращается вокруг X/Y,
// координаты проецируются в 2D с перспективой (слова ближе к зрителю крупнее
// и ярче). Реализовано на Canvas 2D — не требует Three.js/WebGL.

(function initHeroSphere() {
  const canvas = document.getElementById('heroSphere');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TERMS = [
    'ст. 209 ГК РФ', 'исковое заявление', 'ст. 12 ГК РФ', 'апелляция',
    'ст. 131 ГПК РФ', 'регистрация права', 'ст. 401 ГК РФ', 'кассация',
    'ст. 15 ГК РФ', 'исполнительный лист', 'арбитраж', 'ЕГРН',
    'претензия', 'ст. 8 ГК РФ', 'судебный приказ', 'ходатайство',
    'обременение', 'ст. 395 ГК РФ', 'мировое соглашение', 'надзор',
    'договор аренды', 'ст. 610 ГК РФ', 'взыскание долга', 'нотариус',
  ];

  // Распределение точек по сфере равномерно (fibonacci sphere algorithm)
  const points = TERMS.map((text, i) => {
    const n = TERMS.length;
    const y = 1 - (i / (n - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5)); // golden angle
    return {
      text,
      x0: Math.cos(theta) * radiusAtY,
      y0: y,
      z0: Math.sin(theta) * radiusAtY,
    };
  });

  let rotX = 0.3;
  let rotY = 0;
  let targetRotX = 0.3;
  let targetRotY = 0;
  let width = 0, height = 0, radius = 0;
  let hovering = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    radius = Math.min(width, height) * 0.42;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotY = mx * Math.PI * 0.9;
    targetRotX = 0.3 + my * Math.PI * 0.5;
    hovering = true;
  });
  canvas.addEventListener('mouseleave', () => { hovering = false; });

  const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink-soft').trim() || '#B7B0A2';
  const brass = () => getComputedStyle(document.documentElement).getPropertyValue('--brass').trim() || '#D2A567';

  let autoAngle = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw() {
    if (!reduceMotion) {
      // Плавная интерполяция к целевому углу (курсор), лёгкое автовращение в покое
      if (!hovering) {
        autoAngle += 0.0022;
        targetRotY = Math.sin(autoAngle) * 0.5;
      }
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;
    } else {
      rotX = 0.3; rotY = 0;
    }

    ctx.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2;
    const inkColor = ink();
    const brassColor = brass();

    const projected = points.map((p) => {
      // Rotate around Y axis then X axis
      let x = p.x0 * Math.cos(rotY) - p.z0 * Math.sin(rotY);
      let z = p.x0 * Math.sin(rotY) + p.z0 * Math.cos(rotY);
      let y = p.y0 * Math.cos(rotX) - z * Math.sin(rotX);
      z = p.y0 * Math.sin(rotX) + z * Math.cos(rotX);

      const perspective = 2.2 / (2.2 - z);
      return {
        text: p.text,
        sx: cx + x * radius * perspective,
        sy: cy + y * radius * perspective,
        scale: perspective,
        z,
      };
    });

    projected.sort((a, b) => a.z - b.z);

    for (const p of projected) {
      const depthT = (p.z + 1) / 2; // 0 (far) .. 1 (near)
      const fontSize = 10 + depthT * 6;
      const opacity = 0.18 + depthT * 0.55;
      ctx.font = `${fontSize}px 'IBM Plex Mono', ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const isBrass = depthT > 0.75;
      const color = isBrass ? brassColor : inkColor;
      ctx.fillStyle = hexToRgba(color, opacity);
      ctx.fillText(p.text, p.sx, p.sy);
    }

    requestAnimationFrame(draw);
  }

  function hexToRgba(color, alpha) {
    color = color.trim();
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const bigint = parseInt(hex.length === 3
        ? hex.split('').map(c => c + c).join('')
        : hex, 16);
      const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  requestAnimationFrame(draw);
})();
