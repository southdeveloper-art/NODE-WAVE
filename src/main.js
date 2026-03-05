import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  console.log("NW-DEBUG: CORE LOADED");


  // 1. Immediate Reveal Logic (Priority)
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    console.log(`NW-DEBUG: REVEALING ${reveals.length} ELEMENTS`);
    const triggerBottom = window.innerHeight * 0.95;
    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      if (revealTop < triggerBottom) {
        reveal.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Initial check

  // 1b. Navbar Scroll State
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // 2. Mobile Menu Logic
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Background Canvas Effect
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const gridDiv = document.createElement('div');
  gridDiv.className = 'grid-overlay';
  document.body.prepend(gridDiv);

  let particles = [];
  const particleCount = window.innerWidth < 768 ? 40 : 70;
  let mouse = { x: -9999, y: -9999 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }
    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      const repelRadius = 150;
      const repelRadiusSq = repelRadius * repelRadius;
      if (distSq < repelRadiusSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (repelRadius - dist) / repelRadius;
        this.vx += (dx / dist) * force * 1.5;
        this.vy += (dy / dist) * force * 1.5;
      }
      this.vx *= 0.94; this.vy *= 0.94;
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 112, 0, 0.2)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.update(); p.draw();
      const maxDist = 120;
      const maxDistSq = maxDist * maxDist;
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 112, 0, ${0.15 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(animate);
  };
  animate();

  // 4. Heavy Dashboards (Safe Initialization)
  try {
    initHUD();
    initDDoS();
    initGlobalTelemetry();
    initBootLog();
  } catch (e) {
    console.warn("Dashboard initialization failed:", e);
  }

  // 5. Login Modal Logic
  initLoginModal();

  // 6. Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

// HUD Dashboard Logic
function initHUD() {
  const coreArray = document.getElementById('core-array');
  const netCanvas = document.getElementById('diag-net-canvas');
  const netVal = document.getElementById('diag-net-val');

  if (coreArray) {
    // Generate 32 core bars
    for (let i = 0; i < 32; i++) {
      const bar = document.createElement('div');
      bar.className = 'core-bar';
      const fill = document.createElement('div');
      fill.className = 'core-fill';
      bar.appendChild(fill);
      coreArray.appendChild(bar);
    }
    const coreFills = document.querySelectorAll('.core-fill');

    let ctx = null;
    let points = Array(50).fill(20);

    if (netCanvas) {
      ctx = netCanvas.getContext('2d');
      // Set canvas size
      netCanvas.width = netCanvas.offsetWidth;
      netCanvas.height = netCanvas.offsetHeight;
    }

    function updateHUD() {
      // Update core loads (Blocky active/inactive style)
      coreFills.forEach(fill => {
        // Core is active 60% of the time
        const isActive = Math.random() > 0.4;

        // If active, assign a high or medium load color
        if (isActive) {
          const isHighLoad = Math.random() > 0.8;
          if (isHighLoad) {
            fill.style.background = '#ff4d4d'; // Red for high load
            fill.style.boxShadow = '0 0 10px #ff4d4d';
            fill.style.opacity = '1';
          } else {
            fill.style.background = 'var(--primary)'; // Orange normal
            fill.style.boxShadow = '0 0 5px rgba(255, 112, 0, 0.5)';
            fill.style.opacity = '0.8';
          }
        } else {
          // Inactive core
          fill.style.background = 'rgba(255, 255, 255, 0.1)';
          fill.style.boxShadow = 'none';
          fill.style.opacity = '0.3';
        }
      });

      // Update Network Canvas
      if (ctx && netCanvas) {
        points.push(10 + Math.random() * (netCanvas.height - 20));
        points.shift();

        const currentNet = (1.2 + Math.random() * 0.8).toFixed(1);
        if (netVal) netVal.textContent = `${currentNet} Gbps`;

        ctx.clearRect(0, 0, netCanvas.width, netCanvas.height);

        // Draw Grid
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 112, 0, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < netCanvas.width; i += 20) {
          ctx.moveTo(i, 0); ctx.lineTo(i, netCanvas.height);
        }
        for (let i = 0; i < netCanvas.height; i += 20) {
          ctx.moveTo(0, i); ctx.lineTo(netCanvas.width, i);
        }
        ctx.stroke();

        // Draw Aggressive Step Graph
        ctx.beginPath();
        ctx.strokeStyle = '#FF7000';
        ctx.lineWidth = 2;
        ctx.moveTo(0, points[0]);
        for (let i = 1; i < points.length; i++) {
          const prevX = (i - 1) * (netCanvas.width / 49);
          const currX = i * (netCanvas.width / 49);
          // Step logic: horizontal line then vertical line to new point
          ctx.lineTo(currX, points[i - 1]);
          ctx.lineTo(currX, points[i]);
        }
        ctx.stroke();

        // Fill under step graph
        ctx.lineTo(netCanvas.width, netCanvas.height);
        ctx.lineTo(0, netCanvas.height);
        ctx.fillStyle = 'rgba(255, 112, 0, 0.2)';
        ctx.fill();

        // Add sweeping scanner line over the graph
        const scanLineX = (Date.now() / 10) % netCanvas.width;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.moveTo(scanLineX, 0);
        ctx.lineTo(scanLineX, netCanvas.height);
        ctx.stroke();
      }

      // Randomly fluctuate memory and storage slightly for realism
      const memElem = document.getElementById('diag-mem');
      if (memElem && Math.random() > 0.5) {
        const mem = (32.0 + Math.random() * 2).toFixed(1);
        memElem.innerHTML = `${mem} <small>GB / 64 GB</small>`;
      }
    }

    setInterval(updateHUD, 1000);
    updateHUD();

    window.addEventListener('resize', () => {
      if (netCanvas) {
        netCanvas.width = netCanvas.offsetWidth;
        netCanvas.height = netCanvas.offsetHeight;
      }
    });
  }
}


// ─── Mouse Ripple Wave ──────────────────────────────────────────────────────
(function initRipple() {
  const rc = document.createElement('canvas');
  rc.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
  document.body.appendChild(rc);
  const rctx = rc.getContext('2d');

  const resize = () => { rc.width = window.innerWidth; rc.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();

  const ripples = [];
  let lastTime = 0;

  window.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastTime < 60) return; // emit every 60ms max
    lastTime = now;
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 80, alpha: 0.6 });
  });

  function animateRipples() {
    rctx.clearRect(0, 0, rc.width, rc.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 3;
      rp.alpha -= 0.025;
      if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
      rctx.beginPath();
      rctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      rctx.strokeStyle = `rgba(255,112,0,${rp.alpha})`;
      rctx.lineWidth = 2;
      rctx.stroke();
    }
    requestAnimationFrame(animateRipples);
  }
  animateRipples();
})();

// DDoS Mitigation Logic



function initDDoS() {
  const counterEl = document.getElementById('ddos-counter');
  let count = 324629;
  setInterval(() => {
    count += Math.floor(Math.random() * 5) + 1;
    if (counterEl) counterEl.textContent = count.toLocaleString();
  }, 3000);

  // Live Telemetry Fluctuation
  const ingressEl = document.getElementById('live-ingress');
  const packetsEl = document.getElementById('live-packets');

  if (ingressEl && packetsEl) {
    setInterval(() => {
      // Ingress: 1.02 to 55.8 Gbps
      const ingressVal = (1.02 + Math.random() * (55.8 - 1.02)).toFixed(2);
      // Packets: 1.08 to 8.05 Mpps
      const packetsVal = (1.08 + Math.random() * (8.05 - 1.08)).toFixed(2);

      ingressEl.innerHTML = `${ingressVal} <small>Gbps</small>`;
      packetsEl.innerHTML = `${packetsVal} <small>Mpps</small>`;
    }, 2000);
  }

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
    if (liveThroughput) {
      const current = parseFloat(liveThroughput.innerText);
      let next = current + (Math.random() - 0.5) * 0.2;
      if (next < 7) next = 7;
      if (next > 9.8) next = 9.8;
      liveThroughput.innerText = next.toFixed(1);
    }

    const latencyText = document.getElementById('cluster-latency');
    if (latencyText && Math.random() > 0.9) {
      latencyText.innerText = (0.5 + Math.random() * 0.6).toFixed(1);
    }

    const uptimeText = document.getElementById('cluster-uptime');
    if (uptimeText) {
      // Start from 21 days ago relative to March 5th, 2026
      const startDate = new Date('2026-02-12T00:00:00Z');
      const now = new Date();
      const diffTime = Math.abs(now - startDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      uptimeText.innerText = `${diffDays} Days`;
    }

    requestAnimationFrame(draw);
  }

  // Initial call
  draw();
}

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


// Login & Profile Management Logic
function initLoginModal() {
  const loginTrigger = document.getElementById('login-trigger');
  const loginModal = document.getElementById('login-modal');
  const modalClose = document.getElementById('modal-close');
  const navCta = document.getElementById('nav-cta');
  const userProfileNav = document.getElementById('user-profile-nav');

  const loginView = document.getElementById('login-view-content');
  const onboardingView = document.getElementById('onboarding-view-content');

  const saveProfileBtn = document.getElementById('save-profile');
  const googleLoginBtn = document.getElementById('google-login');

  // Check for profile on load
  const updateUI = () => {
    const profile = JSON.parse(localStorage.getItem('userProfile'));
    if (profile && navCta && userProfileNav) {
      navCta.style.display = 'none';
      userProfileNav.style.display = 'flex';

      const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
      document.getElementById('user-avatar-initials').innerText = initials;
      document.getElementById('user-nav-name').innerText = profile.name;
      document.getElementById('user-nav-username').innerText = `@${profile.username}`;
    }
  };

  updateUI();

  // Detect OAuth return
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');

    if (token) {
      // Fetch user info from Google
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            localStorage.setItem('userEmail', data.email);
            const profile = JSON.parse(localStorage.getItem('userProfile'));

            if (!profile) {
              // Show onboarding if no profile yet
              if (loginModal && loginView && onboardingView) {
                loginModal.classList.add('active');
                loginView.style.display = 'none';
                onboardingView.style.display = 'block';
                document.body.style.overflow = 'hidden';
              }
            }
            checkAdminAccess();
          }
        });
    }

    // Clear hash
    history.replaceState(null, null, ' ');
  }

  const checkAdminAccess = () => {
    const adminEmails = ['dhanushdaggumilli@gmail.com', 'rocky@nodewave.in']; // Whitelist
    const email = localStorage.getItem('userEmail');
    const isAdmin = adminEmails.includes(email);

    const adminContent = document.getElementById('admin-dashboard-content');
    const accessDenied = document.getElementById('access-denied');

    if (window.location.pathname.includes('/admin')) {
      if (isAdmin) {
        if (adminContent) adminContent.classList.add('active');
        if (accessDenied) accessDenied.classList.remove('active');
      } else {
        // If not admin, show access denied
        if (adminContent) adminContent.classList.remove('active');
        if (accessDenied) accessDenied.classList.add('active');

        // If not logged in at all, prompt for login
        if (!email && loginModal) {
          loginModal.classList.add('active');
          if (loginView) loginView.style.display = 'block';
          if (onboardingView) onboardingView.style.display = 'none';
        }
      }
    }
  };

  checkAdminAccess();

  if (loginTrigger && loginModal) {
    loginTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.add('active');
      loginView.style.display = 'block';
      onboardingView.style.display = 'none';
      document.body.style.overflow = 'hidden';
    });

    const initiateGoogleLogin = () => {
      const CLIENT_ID = '469545887730-l6dge91uq17a5s86rhph8il8h830o6n1.apps.googleusercontent.com';
      // Standardize REDIRECT_URI to match console entries (strip trailing slash)
      let REDIRECT_URI = window.location.origin + window.location.pathname;
      if (REDIRECT_URI.endsWith('/')) {
        REDIRECT_URI = REDIRECT_URI.slice(0, -1);
      }

      const SCOPE = 'email profile';
      const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;

      window.location.href = AUTH_URL;
    };

    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', initiateGoogleLogin);
    }

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => {
        const name = document.getElementById('full-name').value;
        const username = document.getElementById('username').value;
        const phone = document.getElementById('phone-number').value;

        if (name && username && phone) {
          const profile = { name, username, phone };
          localStorage.setItem('userProfile', JSON.stringify(profile));
          updateUI();
          closeModal();
        } else {
          alert('Please fill in all fields');
        }
      });
    }

    const closeModal = () => {
      loginModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && loginModal.classList.contains('active')) {
        closeModal();
      }
    });

    // Make profile nav clickable to "edit" (show onboarding again)
    if (userProfileNav) {
      userProfileNav.addEventListener('click', () => {
        const profile = JSON.parse(localStorage.getItem('userProfile'));
        if (profile) {
          document.getElementById('full-name').value = profile.name;
          document.getElementById('username').value = profile.username;
          document.getElementById('phone-number').value = profile.phone;
        }
        loginModal.classList.add('active');
        loginView.style.display = 'none';
        onboardingView.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
    }
  }
}
