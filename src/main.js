import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Background GIF/Video Effect
  const videoWrap = document.createElement('div');
  videoWrap.className = 'bg-video-wrap';
  const bgImg = document.createElement('img');
  bgImg.src = 'https://cdn.discordapp.com/attachments/1406728433811329186/1478886383836991570/Animated_Hosting_Company_Logo_Generated.gif?ex=69aa07c6&is=69a8b646&hm=1076ab8e2cb1c2f086869a13b2c7be8f2b9980d96c3dff18e8918203c234a356&';
  videoWrap.appendChild(bgImg);
  document.body.prepend(videoWrap);

  const overlay = document.createElement('div');
  overlay.className = 'bg-overlay';
  document.body.prepend(overlay);

  // Background Canvas Effect
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const gridDiv = document.createElement('div');
  gridDiv.className = 'grid-overlay';
  document.body.prepend(gridDiv);

  let particles = [];
  const particleCount = 60;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 112, 0, 0.3)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.update();
      p.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 112, 0, ${0.15 * (1 - dist / 150)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  };

  animate();

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Reveal on Scroll Logic
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.9;
    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      if (revealTop < triggerBottom) {
        reveal.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // Initialize HUD and DDoS
  initHUD();
  initDDoS();
});

// HUD Dashboard Logic
function initHUD() {
  const hexGrid = document.getElementById('hex-threads');
  const hudLoadFill = document.getElementById('hud-load-fill');
  const memGauge = document.getElementById('mem-gauge');
  const storageGauge = document.getElementById('storage-gauge');
  const memVal = document.getElementById('mem-val');
  const storageVal = document.getElementById('storage-val');
  const netIoVal = document.getElementById('net-io-val');
  const hudLogLive = document.getElementById('hud-log-live');
  const pulseCanvas = document.getElementById('pulse-canvas');

  if (hexGrid) {
    for (let i = 0; i < 32; i++) {
      const hex = document.createElement('div');
      hex.className = 'hex-box';
      hexGrid.appendChild(hex);
    }
    const hexagons = document.querySelectorAll('.hex-box');
    const ctx = pulseCanvas.getContext('2d');
    let points = Array(50).fill(50);

    function updateHUD() {
      let activeCount = 0;
      hexagons.forEach(hex => {
        const active = Math.random() > 0.4;
        if (active) {
          hex.classList.add('active');
          activeCount++;
        } else {
          hex.classList.remove('active');
        }
      });
      const load = Math.round((activeCount / 32) * 100);
      if (hudLoadFill) hudLoadFill.style.width = `${load}%`;

      const mem = (30 + Math.random() * 5).toFixed(1);
      if (memVal) memVal.textContent = mem;
      if (memGauge) memGauge.style.strokeDashoffset = 283 - (283 * (mem / 64));

      const storage = (840 + Math.random() * 2).toFixed(0);
      if (storageVal) storageVal.textContent = storage;
      if (storageGauge) storageGauge.style.strokeDashoffset = 283 - (283 * (storage / 1000));

      points.push(Math.random() * 80 + 10);
      points.shift();
      const net = (1.2 + Math.random() * 0.6).toFixed(1);
      if (netIoVal) netIoVal.textContent = net;

      ctx.clearRect(0, 0, pulseCanvas.width, pulseCanvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#FF7000';
      ctx.lineWidth = 2;
      ctx.moveTo(0, points[0]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(i * (pulseCanvas.width / 49), points[i]);
      }
      ctx.stroke();

      if (Math.random() > 0.8 && hudLogLive) {
        const logs = ["> OPTIMIZING...", "> HANDSHAKE VERIFIED", "> PACKET INJECTED", "> CORE STABILIZED", "> UPLINK: OPTIMAL"];
        const div = document.createElement('div');
        div.textContent = logs[Math.floor(Math.random() * logs.length)];
        hudLogLive.prepend(div);
        if (hudLogLive.children.length > 5) hudLogLive.lastElementChild.remove();
      }
    }

    pulseCanvas.width = pulseCanvas.offsetWidth;
    pulseCanvas.height = pulseCanvas.offsetHeight;
    setInterval(updateHUD, 1000);
    updateHUD();
  }
}

// DDoS Mitigation Logic
function initDDoS() {
  const counterEl = document.getElementById('ddos-counter');
  let count = 324629;
  setInterval(() => {
    count += Math.floor(Math.random() * 5) + 1;
    if (counterEl) counterEl.textContent = count.toLocaleString();
  }, 3000);

  const trafficCanvas = document.getElementById('traffic-monitor');
  if (trafficCanvas) {
    const ctx = trafficCanvas.getContext('2d');
    let t = 0;
    const N = 100;
    const PHI = 1.6180339887;  // golden ratio — guarantees no visible period
    const E = 2.7182818284;
    const PI2 = Math.PI * 2;

    // Noise seed per point so each x has an independent drift
    const noiseSeedC = Array.from({ length: N }, () => Math.random() * 1000);
    const noiseSeedM = Array.from({ length: N }, () => Math.random() * 1000);

    function wave(i, t,
      a1, f1, s1,
      a2, f2, s2,
      a3, f3, s3,
      a4, f4, s4,
      a5, f5, s5,
      noise, noiseSeeds
    ) {
      return (
        a1 * Math.sin(i * f1 + t * s1) +
        a2 * Math.sin(i * f2 + t * s2 + PHI) +
        a3 * Math.sin(i * f3 + t * s3 + E) +
        a4 * Math.cos(i * f4 + t * s4 * PHI) +
        a5 * Math.cos(i * f5 + t * s5 * E) +
        noise * Math.sin(noiseSeeds[i] + t * 0.007)
      );
    }

    function buildClean(H) {
      // Big rolling wave — amplitude modulated so it swells and falls
      return Array.from({ length: N }, (_, i) => {
        const x = i / N;
        const envelope = 0.5 + 0.5 * Math.sin(x * Math.PI * 1.3 + t * 0.007);
        const wave1 = Math.sin(x * Math.PI * 2.1 + t * 0.013) * envelope;
        const wave2 = 0.3 * Math.sin(x * Math.PI * 4.7 + t * 0.021 + PHI);
        return H * 0.55 + H * 0.28 * wave1 + H * 0.07 * wave2;
      });
    }

    function buildMal(H) {
      // Choppier waves — faster, more turbulent, lower baseline
      return Array.from({ length: N }, (_, i) => {
        const x = i / N;
        // Main chop wave
        const chop = Math.sin(x * Math.PI * 3.7 + t * 0.029) *
          (0.4 + 0.6 * Math.sin(x * Math.PI * 1.9 + t * 0.017 + E));
        // Secondary smaller wave going the other direction
        const cross = 0.35 * Math.sin(x * Math.PI * 5.3 - t * 0.021 + PHI);
        return H * 0.30 + H * 0.20 * chop + H * 0.08 * cross;
      });
    }

    function drawWave(data, color, fill) {
      const W = trafficCanvas.width, H = trafficCanvas.height;
      ctx.beginPath();
      ctx.moveTo(0, H - data[0]);
      data.forEach((v, i) => ctx.lineTo((W / (N - 1)) * i, H - Math.max(0, Math.min(H, v))));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (fill) {
        ctx.lineTo(W, H); ctx.lineTo(0, H);
        ctx.fillStyle = fill; ctx.fill();
      }
    }

    function drawTraffic() {
      trafficCanvas.width = trafficCanvas.offsetWidth;
      trafficCanvas.height = trafficCanvas.offsetHeight;
      ctx.clearRect(0, 0, trafficCanvas.width, trafficCanvas.height);

      drawWave(buildClean(trafficCanvas.height), '#FF7000', 'rgba(255, 112, 0, 0.12)');
      drawWave(buildMal(trafficCanvas.height), '#ff4d4d', 'rgba(255, 77, 77, 0.12)');

      t += 1;
      requestAnimationFrame(drawTraffic);
    }
    drawTraffic();
  }

  const logBox = document.getElementById('scrub-logs');
  function addLog() {
    if (!logBox) return;
    const types = ['UDP Flood', 'SYN Flood', 'ACK Flood', 'DNS Amp', 'HTTP Flood'];
    const origins = ['CN', 'RU', 'BR', 'US', 'NL', 'DE'];
    const time = new Date().toLocaleTimeString();
    const type = types[Math.floor(Math.random() * types.length)];
    const log = document.createElement('div');
    log.className = 'log-entry mitigation';
    log.innerHTML = `[${time}] <span style="color:#fff">MITIGATION</span>: ${type} Origin: ${origins[Math.floor(Math.random() * origins.length)]} | ${(Math.random() * 50).toFixed(2)} Gbps blocked`;
    logBox.prepend(log);
    if (logBox.children.length > 15) logBox.lastChild.remove();
    setTimeout(addLog, Math.random() * 2000 + 500);
  }
  addLog();

  const radarCanvas = document.getElementById('threat-radar');
  if (radarCanvas) {
    const ctx = radarCanvas.getContext('2d');
    const labels = ['VOLUME', 'COMPLEXITY', 'IMPACT', 'DURATION', 'FREQ', 'SPEED'];
    let values = [80, 45, 90, 60, 70, 55];
    let sweepAngle = 0;
    const blips = [];

    function addBlip() {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * 0.6;
      blips.push({ angle, dist, alpha: 1, life: 120 });
      if (blips.length > 10) blips.shift();
    }

    function drawRadar() {
      const W = radarCanvas.width, H = radarCanvas.height;
      const cX = W / 2, cY = H / 2;
      const r = Math.min(cX, cY) * 0.82;

      ctx.clearRect(0, 0, W, H);

      // === GRID RINGS ===
      for (let j = 1; j <= 4; j++) {
        const ringR = (r / 4) * j;
        ctx.beginPath();
        ctx.arc(cX, cY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = j === 4 ? 'rgba(255, 112, 0, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = j === 4 ? 1.5 : 1;
        ctx.stroke();
      }

      // === GRID SPOKES ===
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(cX + r * Math.cos(a), cY + r * Math.sin(a));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // === RADAR SWEEP ===
      const sweepGrad = ctx.createConicalGradient
        ? ctx.createConicalGradient(cX, cY, sweepAngle)
        : null;

      // Draw sweep as arc fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.arc(cX, cY, r, sweepAngle, sweepAngle + Math.PI / 2.5);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cX, cY, 0, cX, cY, r);
      grad.addColorStop(0, 'rgba(255, 112, 0, 0)');
      grad.addColorStop(0.5, 'rgba(255, 112, 0, 0.06)');
      grad.addColorStop(1, 'rgba(255, 112, 0, 0.02)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(cX + r * Math.cos(sweepAngle), cY + r * Math.sin(sweepAngle));
      ctx.strokeStyle = 'rgba(255, 112, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FF7000';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // === BLIPS ===
      blips.forEach(b => {
        const bx = cX + r * b.dist * Math.cos(b.angle);
        const by = cY + r * b.dist * Math.sin(b.angle);
        const diff = sweepAngle - b.angle;
        const normalDiff = ((diff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (normalDiff < Math.PI * 0.6) {
          const alpha = 1 - normalDiff / (Math.PI * 0.6);
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 112, 0, ${alpha * 0.9})`;
          ctx.shadowColor = '#FF7000';
          ctx.shadowBlur = 10 * alpha;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // === THREAT POLYGON ===
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 112, 0, 0.9)';
      ctx.fillStyle = 'rgba(255, 112, 0, 0.15)';
      ctx.lineWidth = 1.5;
      values.forEach((v, i) => {
        const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
        const radius = (r * v) / 100;
        if (i === 0) ctx.moveTo(cX + radius * Math.cos(a), cY + radius * Math.sin(a));
        else ctx.lineTo(cX + radius * Math.cos(a), cY + radius * Math.sin(a));
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // === AXIS LABELS ===
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 9px "Barlow Condensed", monospace';
      ctx.textAlign = 'center';
      labels.forEach((label, i) => {
        const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
        const lx = cX + (r + 20) * Math.cos(a);
        const ly = cY + (r + 20) * Math.sin(a);
        ctx.fillText(label, lx, ly);
      });

      // Update
      values = values.map(v => Math.max(20, Math.min(100, v + (Math.random() - 0.5) * 3)));
      sweepAngle = (sweepAngle + 0.04) % (Math.PI * 2);
      if (Math.random() > 0.95) addBlip();

      requestAnimationFrame(drawRadar);
    }

    // Set canvas size to match housing
    function resizeRadar() {
      radarCanvas.width = radarCanvas.parentElement.offsetWidth;
      radarCanvas.height = radarCanvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resizeRadar);
    resizeRadar();
    drawRadar();
  }
}

// Global Telemetry Canvas
function initGlobalTelemetry() {
  const canvas = document.getElementById('global-telemetry-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let phase = 0;
  const waves = [
    { amplitude: 40, frequency: 0.01, speed: 0.05, color: 'rgba(255, 112, 0, 0.1)' },
    { amplitude: 60, frequency: 0.005, speed: 0.03, color: 'rgba(255, 112, 0, 0.05)' },
    { amplitude: 20, frequency: 0.02, speed: 0.08, color: 'rgba(255, 112, 0, 0.2)' }
  ];

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw waves
    const centerY = canvas.height / 2;

    waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < canvas.width; x += 5) {
        const y = centerY + Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude * Math.sin(phase * 0.01);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill below wave
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = wave.color.replace('0.1', '0.02').replace('0.2', '0.05');
      ctx.fill();
    });

    phase++;

    // Update numbers
    const liveThroughput = document.getElementById('live-throughput');
    if (liveThroughput && Math.random() > 0.8) {
      const current = parseFloat(liveThroughput.innerText);
      let next = current + (Math.random() - 0.5) * 0.4;
      if (next < 5) next = 5;
      if (next > 9.8) next = 9.8;
      liveThroughput.innerText = next.toFixed(1);
    }

    const latencyText = document.getElementById('cluster-latency');
    if (latencyText && Math.random() > 0.9) {
      latencyText.innerText = (0.5 + Math.random() * 0.6).toFixed(1);
    }

    requestAnimationFrame(draw);
  }

  draw();
}

// Initialize all canvases
setTimeout(() => {
  initRadarAndTraffic();
  initGlobalTelemetry();
}, 500);

// ─── Boot Log Typewriter ───────────────────────────────────────────────
function initBootLog() {
  const terminal = document.getElementById('hud-terminal');
  if (!terminal) return;

  const lines = [
    { text: '> INITIALIZING NEURAL LINK...', orange: false },
    { text: '> OPTIMIZING PACKET FLOW [FRANKFURT]', orange: false },
    { text: '> CORE STABILIZED', orange: false },
    { text: '> UPLINK: OPTIMAL', orange: false },
    { text: '> NETWORK ROUTE OPTIMIZED', orange: true },
    { text: '> DDOS FILTER ACTIVE', orange: true },
    { text: '> KERNEL SCHEDULER STABLE', orange: true },
    { text: '> PACKET LATENCY: 1.2MS', orange: true },
  ];

  let lineIdx = 0;

  function typeLine(lineObj, cb) {
    const div = document.createElement('div');
    div.className = 'term-line' + (lineObj.orange ? ' text-primary' : '');
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;

    let charIdx = 0;
    const interval = setInterval(() => {
      div.textContent = lineObj.text.slice(0, ++charIdx);
      terminal.scrollTop = terminal.scrollHeight;
      if (charIdx >= lineObj.text.length) {
        clearInterval(interval);
        if (cb) cb();
      }
    }, 28);
  }

  function nextLine() {
    if (lineIdx >= lines.length) {
      // Loop: clear and restart after 5s
      setTimeout(() => {
        terminal.innerHTML = '';
        lineIdx = 0;
        nextLine();
      }, 5000);
      return;
    }
    typeLine(lines[lineIdx++], () => {
      setTimeout(nextLine, 200 + Math.random() * 300);
    });
  }

  nextLine();
}

setTimeout(initBootLog, 800);
