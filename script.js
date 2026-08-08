const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
const STAR_COUNT = 250;

const STAR_COLORS = [
    '#ffffff',
    '#ffb8b8',
    '#ffd166',
    '#70a1ff',
    '#ff9ff3',
    '#eccc68'
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
            alpha: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        // Update twinkling transparency
        star.alpha += star.twinkleSpeed * star.direction;
        if (star.alpha >= 1) {
            star.alpha = 1;
            star.direction = -1;
        } else if (star.alpha <= 0.1) {
            star.alpha = 0.1;
            star.direction = 1;
        }

        // Draw star glow
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.shadowBlur = star.radius * 4;
        ctx.shadowColor = star.color;
        ctx.fillStyle = star.color;

        // Draw star shape
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
animate();