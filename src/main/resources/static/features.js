/**
 * features.js — Skillgram Premium Features
 * 1. Clap Particle Burst
 * 2. Skill Radar Chart (Chart.js)
 * 3. Real-Time Feed (SockJS + STOMP WebSocket)
 * 4. Code Snippet Syntax Highlighting (Prism.js)
 */

// ═══════════════════════════════════════════════════════════════
// 1. CLAP PARTICLE BURST — Canvas physics explosion on clap click
// ═══════════════════════════════════════════════════════════════

const ClapBurst = (() => {
    const canvas = document.getElementById('clap-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let animFrameId = null;

    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const PALETTES = [
        ['#a78bfa', '#7c3aed', '#c4b5fd', '#ddd6fe'], // purple
        ['#22d3ee', '#06b6d4', '#67e8f9', '#a5f3fc'], // cyan
        ['#f472b6', '#ec4899', '#fbcfe8', '#fda4af'], // pink
        ['#34d399', '#10b981', '#6ee7b7', '#a7f3d0'], // green
        ['#fbbf24', '#f59e0b', '#fde68a', '#fef3c7'], // gold
    ];

    class Particle {
        constructor(x, y, palette) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - Math.random() * 4;
            this.alpha = 1;
            this.radius = 3 + Math.random() * 5;
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.gravity = 0.18;
            this.decay = 0.018 + Math.random() * 0.01;
            this.shape = Math.random() > 0.5 ? 'circle' : 'star';
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.2;
        }

        update() {
            this.vx *= 0.97;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            this.rotation += this.rotSpeed;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;

            if (this.shape === 'star') {
                drawStar(ctx, 0, 0, 5, this.radius, this.radius * 0.4);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
        ctx.fill();
    }

    function loop() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.alpha > 0);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        if (particles.length > 0) {
            animFrameId = requestAnimationFrame(loop);
        }
    }

    function burst(x, y) {
        if (!ctx) return;
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        const count = 45 + Math.floor(Math.random() * 25);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, palette));
        }
        if (animFrameId) cancelAnimationFrame(animFrameId);
        loop();
    }

    return { burst };
})();

// ═══════════════════════════════════════════════════════════════
// 2. SKILL RADAR CHART — Chart.js animated hexagonal radar
// ═══════════════════════════════════════════════════════════════

const RadarChart = (() => {
    let chart = null;

    const SKILL_LEVELS = {
        // Frontend
        'react': 90, 'vue': 80, 'angular': 70, 'svelte': 75, 'html': 95, 'css': 90,
        'tailwind': 85, 'typescript': 88, 'javascript': 92, 'nextjs': 82,
        // Backend
        'java': 88, 'spring boot': 85, 'python': 80, 'node': 78, 'go': 72,
        'rust': 65, 'php': 70, 'ruby': 68, 'cpp': 75, 'c#': 77,
        // Data / DB
        'mysql': 82, 'postgresql': 80, 'mongodb': 78, 'redis': 75, 'sql': 83,
        // DevOps
        'docker': 80, 'kubernetes': 70, 'aws': 75, 'git': 92, 'linux': 85,
        'ci/cd': 78, 'terraform': 68,
        // Misc
        'graphql': 76, 'rest api': 88, 'websockets': 72, 'machine learning': 65,
    };

    function getLevel(skill) {
        const key = skill.trim().toLowerCase();
        return SKILL_LEVELS[key] || (50 + Math.floor(Math.random() * 40));
    }

    function buildPalette(count) {
        const hues = [264, 192, 330, 144, 38, 204];
        return hues.slice(0, count).map(h => `hsl(${h}, 80%, 65%)`);
    }

    function render(skills) {
        const canvas = document.getElementById('skill-radar-chart');
        const wrapper = document.getElementById('radar-chart-wrapper');
        const hint = document.getElementById('radar-hint');
        if (!canvas) return;

        const valid = skills.filter(s => s.trim().length > 0).slice(0, 8);
        if (valid.length < 2) {
            wrapper.style.display = 'none';
            if (hint) hint.style.display = '';
            return;
        }

        wrapper.style.display = 'block';
        if (hint) hint.style.display = 'none';

        const labels = valid.map(s => s.trim());
        const data = labels.map(getLevel);
        const colors = buildPalette(labels.length);
        const gradientColor = 'rgba(139, 92, 246, 0.25)';
        const borderColor = 'rgba(139, 92, 246, 0.9)';

        if (chart) chart.destroy();

        chart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels,
                datasets: [{
                    label: 'Skill Level',
                    data,
                    backgroundColor: gradientColor,
                    borderColor,
                    borderWidth: 2,
                    pointBackgroundColor: colors,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: borderColor,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                animation: { duration: 900, easing: 'easeInOutQuart' },
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,30,0.92)',
                        titleColor: '#a78bfa',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(139,92,246,0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: ctx => `  ${ctx.raw}% proficiency`
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        beginAtZero: true,
                        grid: { color: 'rgba(139,92,246,0.15)' },
                        angleLines: { color: 'rgba(139,92,246,0.2)' },
                        ticks: {
                            display: false,
                            stepSize: 25,
                        },
                        pointLabels: {
                            font: { family: 'Outfit', size: 11, weight: '600' },
                            color: '#c4b5fd',
                        }
                    }
                }
            }
        });
    }

    return { render };
})();

// ═══════════════════════════════════════════════════════════════
// 3. REAL-TIME FEED — SockJS + STOMP WebSocket
// ═══════════════════════════════════════════════════════════════

const RealtimeFeed = (() => {
    let stompClient = null;
    let pendingPosts = [];
    let onNewPostCallback = null;

    const dot = document.getElementById('live-dot');
    const statusText = document.getElementById('live-status-text');
    const banner = document.getElementById('realtime-banner');
    const bannerText = document.getElementById('realtime-banner-text');
    const bannerRefresh = document.getElementById('realtime-banner-refresh');

    function setStatus(status) {
        if (!dot || !statusText) return;
        dot.className = 'live-dot';
        if (status === 'connected') {
            dot.classList.add('live-dot--connected');
            statusText.textContent = 'Live — real-time';
        } else if (status === 'reconnecting') {
            dot.classList.add('live-dot--reconnecting');
            statusText.textContent = 'Reconnecting...';
        } else {
            dot.classList.add('live-dot--offline');
            statusText.textContent = 'Offline';
        }
    }

    function showBanner(post) {
        if (!banner) return;
        bannerText.textContent = `New post: "${post.title || 'Untitled'}"`;
        banner.classList.remove('hidden');
        banner.classList.add('banner-slide-in');
        setTimeout(() => {
            banner.classList.remove('banner-slide-in');
            banner.classList.add('hidden');
        }, 8000);
    }

    function connect(onNewPost) {
        onNewPostCallback = onNewPost;
        setStatus('reconnecting');
        try {
            const sock = new SockJS('/ws');
            stompClient = Stomp.over(sock);
            stompClient.debug = null; // silence debug logs

            stompClient.connect({}, () => {
                setStatus('connected');
                stompClient.subscribe('/topic/feed', (msg) => {
                    const post = JSON.parse(msg.body);
                    pendingPosts.push(post);
                    showBanner(post);
                    if (onNewPostCallback) onNewPostCallback(post);
                });
            }, (err) => {
                setStatus('offline');
                setTimeout(() => connect(onNewPostCallback), 5000);
            });
        } catch (e) {
            setStatus('offline');
        }
    }

    function disconnect() {
        if (stompClient) stompClient.disconnect();
        setStatus('offline');
    }

    if (bannerRefresh) {
        bannerRefresh.addEventListener('click', () => {
            banner.classList.add('hidden');
            if (window._skillgramRefreshFeed) window._skillgramRefreshFeed();
        });
    }

    return { connect, disconnect, setStatus };
})();

// ═══════════════════════════════════════════════════════════════
// 4. CODE SNIPPET COPY BUTTON helper (called from app.js card build)
// ═══════════════════════════════════════════════════════════════

function attachCopyBtn(preEl) {
    const copyBtn = preEl.parentElement.querySelector('.copy-btn');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', () => {
        const code = preEl.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            copyBtn.style.color = '#34d399';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                copyBtn.style.color = '';
            }, 2000);
        });
    });
}

// Clear code button in post modal
document.addEventListener('DOMContentLoaded', () => {
    const clearBtn = document.getElementById('btn-clear-code');
    const codeArea = document.getElementById('post-code');
    const langSelect = document.getElementById('post-code-lang');
    if (clearBtn && codeArea) {
        clearBtn.addEventListener('click', () => {
            codeArea.value = '';
            if (langSelect) langSelect.value = '';
        });
    }
});

// Expose globally for app.js
window.ClapBurst = ClapBurst;
window.RadarChart = RadarChart;
window.RealtimeFeed = RealtimeFeed;
window.attachCopyBtn = attachCopyBtn;
