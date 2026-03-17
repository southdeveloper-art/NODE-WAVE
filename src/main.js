async function loadIncludes() {
  const includes = document.querySelectorAll('[data-include]');
  for (const el of includes) {
    const file = el.getAttribute('data-include');
    try {
      const response = await fetch('/' + (file.startsWith('/') ? file.slice(1) : file));
      if (response.ok) {
        el.innerHTML = await response.text();
      }
    } catch (err) {
      console.error(`Error loading include ${file}:`, err);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadIncludes();
  initLoginModal(); // Initialize modal listeners after includes are loaded
  document.body.classList.add('loaded');
  initReviews(); // Start reviews synchronization

  window.addEventListener('click', (e) => {
    const btn = e.target.closest('.order-now-btn');
    if (btn) {
      console.log("NW-DEBUG: WINDOW CLICK CAPTURED", btn.getAttribute('data-plan'));
      // alert("NW-DEBUG: WINDOW CLICK CAPTURED for " + btn.getAttribute('data-plan'));
      // e.preventDefault(); // Optional: stop navigation if needed
    }
  }, true); // Capture phase focus


  // 1. Optimized Reveal Logic (Intersection Observer)
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Stop watching once revealed
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => revealObserver.observe(el));

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

    initGlobalTelemetry();
    initBootLog();
    initFAQ();
  } catch (e) {
    console.warn("Dashboard initialization failed:", e);
  }

  // 5. Login Modal Logic
  initLoginModal();

  // 5.5 Checkout & Redirect Flow
  try {
    initCheckout();
    if (window.location.pathname.includes('/order/')) {
        initOrderPage();
    }
  } catch (err) {
    console.error("NW-DEBUG: Order initialization failed", err);
  }

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

  // 6.5 Dynamic Hero Tab Switcher via Quick Nav Bar
  const qnbItems = document.querySelectorAll('.qnb-item');
  const heroSection = document.querySelector('.hero');
  const heroContentContainer = document.querySelector('.hero-content');
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroBtns = document.querySelector('.hero-btns');

  const btnStylePrimary = 'style="background: #FF7000; border-color: #FF7000; color: white; box-shadow: 0 0 25px rgba(255, 112, 0, 0.4);"';
  const btnStyleOutline = 'style="border: none; padding-left: 0; padding-right: 0;"';
  const bgGradient = 'linear-gradient(to right, rgba(10, 10, 12, 0.95) 0%, rgba(10, 10, 12, 0.4) 100%)';

  const heroTabData = {
    'dedicated': {
      title: '<i>Total <span class="text-orange">Bare Metal</span> Domination</i>',
      subtitle: 'Stop sharing resources. Our dedicated Ryzen 9 9950X3D nodes provide raw, unvirtualized performance for high-stakes projects and massive player bases.',
      buttons: `<a href="/gds/" class="btn btn-primary" ${btnStylePrimary}>Browse Servers</a> <a href="/budget/" class="btn btn-outline" ${btnStyleOutline}>Budget Servers &rarr;</a>`,
      isLong: true,
      bgImage: `${bgGradient}, url('/dedicated_server_bg.png')`
    },
    'fivem': {
      title: '<i>Unleash <span class="text-orange">Absolute Power</span></i>',
      subtitle: 'Don\'t settle for less. Our custom-built Ryzen 9 9950X3D nodes deliver the processing power that high-population communities demand. Zero lag, 100% uptime, 17Tbit protection.',
      buttons: `<a href="/plans/" class="btn btn-primary" ${btnStylePrimary}>Deploy Server Now</a> <a href="#specs" class="btn btn-outline" ${btnStyleOutline}>Performance Specs &rarr;</a>`,
      isLong: true,
      bgImage: `${bgGradient}, url('/fivem_server_bg.png')`
    },
    'discord': {
      title: '<i>24/7 <span class="text-orange">Discord Bot</span> Hosting</i>',
      subtitle: 'Keep your bots online with zero downtime. High-performance containers built to scale with your Discord communities. Enterprise reliability at community prices.',
      buttons: `<a href="/discord-bot/" class="btn btn-primary" ${btnStylePrimary}>View Bot Plans</a> <a href="#features" class="btn btn-outline" ${btnStyleOutline}>See Features &rarr;</a>`,
      isLong: true,
      bgImage: `${bgGradient}, url('/discord_bot_bg.png')`
    },
    'network': {
      title: '<i>17Tbit Global <span class="text-orange">Anycast</span> Network</i>',
      subtitle: 'Game dedicated DDoS protection spanning across multiple global PoPs ensuring your players stay connected with ultra-low latency and absolute stability.',
      buttons: `<a href="/network/" class="btn btn-primary" ${btnStylePrimary}>View Network Map</a> <a href="/mitigation/" class="btn btn-outline" ${btnStyleOutline}>Anti-DDoS Specs &rarr;</a>`,
      isLong: true,
      bgImage: `${bgGradient}, url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920')`
    }
  };

  if (qnbItems.length > 0 && heroContentContainer) {
    let currentTabIndex = 0; // FiveM is now first
    let tabDirection = 1;
    let autoSwitchInterval;

    const performTabSwitch = (index) => {
      const item = qnbItems[index];
      const tabId = item.getAttribute('data-tab');
      const data = heroTabData[tabId];

      // Remove active state from all
      qnbItems.forEach(nav => nav.classList.remove('active'));
      // Add active state to current
      item.classList.add('active');

      if (data) {
        // Slide out to the left
        heroContentContainer.classList.add('exiting');

        setTimeout(() => {
          // Swap content
          heroTitle.innerHTML = data.title;
          heroSubtitle.innerHTML = data.subtitle;
          heroBtns.innerHTML = data.buttons;

          if (data.isLong) {
            heroTitle.classList.add('title-long');
          } else {
            heroTitle.classList.remove('title-long');
          }

          // Switch background
          if (heroSection) {
            heroSection.style.backgroundImage = data.bgImage;
          }

          // Reset to right position (instant)
          heroContentContainer.classList.remove('exiting');
          heroContentContainer.classList.add('entering');
          
          // Force reflow
          void heroContentContainer.offsetWidth;

          // Slide in from the right
          heroContentContainer.classList.remove('entering');
        }, 300);
      }
    };

    const startAutoSwitch = () => {
      if (autoSwitchInterval) clearInterval(autoSwitchInterval);
      autoSwitchInterval = setInterval(() => {
        // Update index with ping-pong logic
        currentTabIndex += tabDirection;
        
        if (currentTabIndex >= qnbItems.length - 1) {
          currentTabIndex = qnbItems.length - 1;
          tabDirection = -1; // Reverse to left
        } else if (currentTabIndex <= 0) {
          currentTabIndex = 0;
          tabDirection = 1; // Reverse to right
        }
        
        performTabSwitch(currentTabIndex);
      }, 5000);
    };

    qnbItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        currentTabIndex = index;
        
        // Adjust direction based on position
        if (currentTabIndex === 0) tabDirection = 1;
        if (currentTabIndex === qnbItems.length - 1) tabDirection = -1;
        
        performTabSwitch(currentTabIndex);
        startAutoSwitch(); // Reset timer on click
      });
    });

    // Start the interval
    startAutoSwitch();
  }


  // 7. FAQ Accordion Logic
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      item.addEventListener('click', () => {
        // Close others if desired
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    });
  }

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


  // ─── DDoS Mitigation Logic ──────────────────────────────────────────────────



  function initDDoS() {
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




  // Helper to open login modal from anywhere
  window.openLoginModal = () => {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.add('active');
      const loginView = document.getElementById('login-view-content');
      const onboardingView = document.getElementById('onboarding-view-content');
      if (loginView) loginView.style.display = 'block';
      if (onboardingView) onboardingView.style.display = 'none';
      document.body.style.overflow = 'hidden';
    }
  };

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
          if (!email) {
            window.openLoginModal();
          }
        }
      }
    };

    checkAdminAccess();

    if (loginTrigger && loginModal) {
      loginTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        window.openLoginModal();
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

  function initCheckout() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.order-now-btn');
      if (btn) {
        console.log("NW-DEBUG: Order button clicked, redirecting...");
        e.preventDefault();
        
        // 1. Login Check
        const profile = localStorage.getItem('userProfile');
        if (!profile) {
          window.openLoginModal();
          return;
        }

        // 2. Extract Plan Info
        const plan = btn.getAttribute('data-plan') || 'Custom Server';
        const price = btn.getAttribute('data-price') || '0';

        // 3. Redirect to dedicated order page
        window.location.href = `/order/?plan=${encodeURIComponent(plan)}&price=${price}`;
      }
    });
  }

  function initOrderPage() {
    const displayPlan = document.getElementById('display-plan');
    const displayTotal = document.getElementById('display-total');
    const billingCycle = document.getElementById('billing-cycle');
    const payNowBtn = document.getElementById('pay-now-btn');

    if (!displayPlan || !billingCycle || !payNowBtn) return;

    // 1. Parse URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const planName = urlParams.get('plan') || 'Premium Plan';
    const basePrice = parseFloat(urlParams.get('price')) || 0;

    let currentOrder = { plan: planName, basePrice: basePrice, totalMonths: 1, totalPrice: basePrice };

    // 2. Setup Displays
    displayPlan.innerText = planName;
    
    const updateOrderTotal = () => {
      let months = parseInt(billingCycle.value);
      let discount = 1;
      
      if (months === 3) discount = 0.95;
      if (months === 6) discount = 0.90;
      if (months === 12) discount = 0.80;
      
      let totalPrice = (basePrice * months * discount).toFixed(2);
      currentOrder.totalMonths = months;
      currentOrder.totalPrice = totalPrice;
      displayTotal.innerText = `€${totalPrice}`;
    };

    billingCycle.addEventListener('change', updateOrderTotal);
    updateOrderTotal(); // Initial run

    // 3. Razorpay Integration
    payNowBtn.addEventListener('click', () => {
      if (typeof Razorpay === 'undefined') {
        alert("Razorpay SDK not loaded! Please check your connection.");
        return;
      }

      const email = localStorage.getItem('userEmail') || 'customer@example.com';
      const profileStr = localStorage.getItem('userProfile');
      const profile = profileStr ? JSON.parse(profileStr) : { name: 'Customer', phone: '0000000000' };

      const options = {
        "key": "rzp_live_SSB4VW22k8P3l9", 
        "amount": Math.round(parseFloat(currentOrder.totalPrice) * 100), 
        "currency": "EUR",
        "name": "NodeWave",
        "description": `Payment for ${currentOrder.plan} (${currentOrder.totalMonths} Month(s))`,
        "image": "/nw_logo_white.svg",
        "handler": function (response) {
          alert(`Success! Payment ID: ${response.razorpay_payment_id}`);
          window.location.href = '/plans/'; // Return home after success
        },
        "prefill": {
          "name": profile.name,
          "email": email,
          "contact": profile.phone
        },
        "theme": { "color": "#FF7000" }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
});

// Reviews System
function initReviews() {
    const defaultReviews = [
        { name: "Alex G.", role: "NodeWave User", text: "Best server performance ever!" },
        { name: "Sarah M.", role: "Community Owner", text: "NodeShield is a lifesaver." },
        { name: "Mike R.", role: "Developer", text: "Incredibly fast support team." },
        { name: "Kevin L.", role: "Gamer", text: "Smooth setup, zero downtime." }
    ];

    let reviews = JSON.parse(localStorage.getItem('nodewave_reviews')) || defaultReviews;

    const reviewsGrid = document.getElementById('reviews-display-grid');
    const reviewForm = document.getElementById('review-form');
    const footerTicker = document.querySelector('.reviews-ticker');

    // Update Footer Ticker
    if (footerTicker) {
        renderFooterTicker(reviews, footerTicker);
    }

    // Render Grid (if on reviews page)
    if (reviewsGrid) {
        renderReviewsGrid(reviews, reviewsGrid);
    }

    // Handle Submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('review-name').value;
            const role = document.getElementById('review-role').value;
            const text = document.getElementById('review-text').value;

            const newReview = { name, role, text };
            reviews.unshift(newReview);
            localStorage.setItem('nodewave_reviews', JSON.stringify(reviews));

            reviewForm.reset();
            
            // Re-render
            if (reviewsGrid) renderReviewsGrid(reviews, reviewsGrid);
            if (footerTicker) renderFooterTicker(reviews, footerTicker);
            
            alert('Thank you for your review!');
        });
    }
}

function renderReviewsGrid(reviews, container) {
    container.innerHTML = reviews.map(rev => `
        <div class="review-card reveal active">
            <div class="review-header">
                <div class="review-avatar">${rev.name.charAt(0)}</div>
                <div class="review-info">
                    <h3>${rev.name}</h3>
                    <p>${rev.role}</p>
                </div>
            </div>
            <div class="review-content">"${rev.text}"</div>
        </div>
    `).join('');
}

function renderFooterTicker(reviews, container) {
    // Show top 4 for the ticker
    const tickerReviews = reviews.slice(0, 4);
    container.innerHTML = tickerReviews.map(rev => `
        <div class="review-item">"${rev.text}" <span>- ${rev.name}</span></div>
    `).join('');
}
