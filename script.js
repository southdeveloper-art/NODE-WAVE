document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Background Snow Animation
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 100;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Snowflake {
            constructor() {
                this.init(true);
            }

            init(randomY = false) {
                this.x = Math.random() * canvas.width;
                this.y = randomY ? Math.random() * canvas.height : -10;
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = Math.random() * 1.5 + 0.5;
                this.size = Math.random() * 2.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Gentle sway
                this.vx += (Math.random() - 0.5) * 0.05;

                // Reset if it goes off screen
                if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
                    this.init();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Snowflake());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }


    // Scroll effect removed based on user request.

    // FAQ Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-question i');
            
            // Toggle visibility
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                item.style.borderColor = 'var(--border)';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                item.style.borderColor = 'var(--primary)';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
});
