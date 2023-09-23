// Configurable parameters
const config = {
    star_count: 1000,
    star_speed: 0.0015,
    star_size: 1.5,

    // Trackers ("fireworks")
    max_trackers: 5,
    star_track_distance: 0.05,

    // Delays
    initial_delay: 2.5,
    min_delay: 2,
    max_delay: 20,

    // Duration
    min_duration: 4,
    max_duration: 9
};
let counter = 0;

class Star {
    constructor() {
        this.x = Math.random();
        this.y = Math.random();
        this.size = Math.random() * config.star_size;
        this.brightness = Math.random();
        this.color = this.randomColor();
        this.direction = Math.random() * Math.PI * 2; // Random direction
        this.speed = 0;
        this.tracker = false;
    }

    randomColor() {
        const colors = ['#add8e6', '#ffffff', '#ffffe0', '#ffd700', '#ff8c00', '#ff4500'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    move(modifier = 1) {
        this.x += Math.cos(this.direction) * this.speed * modifier;
        this.y += Math.sin(this.direction) * this.speed * modifier;

        // Wrap around top/bottom
        if (this.y < 0) {
            this.y = 1;
        } else if (this.y > 1) {
            this.y = 0;
        }

        // Wrap around left/right
        if (this.x < 0) {
            this.x = 1;
        } else if (this.x > 1) {
            this.x = 0;
        }
    }
}

let stars = [...Array(config.star_count)].map(() => new Star());

function drawStars(alphaModulator = 0) {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTrackers(ctx, alphaModulator);

    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.brightness;
        ctx.fill();
    }
}

function drawTrackers(ctx, alpha_modulator) {
    for (const star of stars) {
        if (star.tracker) {
            for (const target of stars) { // This becomes expensive with more trackers enabled
                if (target !== star) {
                    const dx = star.x - target.x;
                    const dy = star.y - target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.star_track_distance) {
                        ctx.beginPath();
                        ctx.moveTo(star.x * innerWidth, star.y * innerHeight);
                        ctx.lineTo(target.x * innerWidth, target.y * innerHeight);
                        ctx.strokeStyle = target.color;
                        ctx.globalAlpha = alpha_modulator *.5;
                        ctx.stroke();
                    }
                }
            }
        }
    }
}

function moveStars(duration = 0) {
    // Set the duration if it is not set
    if (duration === 0) {
        duration = Math.random() * (config.max_duration - config.min_duration) + config.min_duration;
    }
    const total_duration = duration * 1000;

    let starsMoving = true;
    for (const star of stars) {
        star.speed = Math.random() * config.star_speed; // Random speed
        star.direction = Math.random() * Math.PI * 2; // Random direction
    }

    let startTime;
    let prevTime;
    let t = 0;
    
    function animate(timestamp) {
        if (!startTime) {
            startTime = timestamp;
            prevTime = timestamp;
        }
    
        const elapsed = timestamp - startTime;
        const deltaTime = timestamp - prevTime;
    
        if (elapsed >= total_duration) {
            starsMoving = false;
            return; // Stop the animation
        }
    
        // Calculate how much to increment t based on deltaTime
        const increment = deltaTime / total_duration;
        t += increment;

        // Sin function to start slow, speed up, then slow down
        const timeModulator = Math.sin(Math.PI * t);

        for (const star of stars) {
            star.move(timeModulator);
        }
    
        drawStars(timeModulator);
    
        prevTime = timestamp;
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

function startStarMovement() {
    const random_delay = Math.random() * (config.max_delay - config.min_delay) + config.min_delay;
    const movement_duration = Math.random() * (config.max_duration - config.min_duration) + config.min_duration;

    counter = counter + 1;

    // Clear star trackers
    for (const star of stars) {
        star.tracker = false;
    }
    
    // Track a random star
    const trackers = Math.floor(Math.random() * config.max_trackers);
    for (let i = 0; i < trackers; i++) {
      stars[Math.floor(Math.random() * stars.length)].tracker = true;
    }

    console.log(`Counter: ${counter}, Duration: ${movement_duration}, Delay: ${random_delay}s`);
    moveStars(movement_duration);

    setTimeout(() => {
        startStarMovement();
    }, (random_delay + movement_duration) * 1000);
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('starfield');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set the --rotate-angle CSS variable to a random value between 0 and 360
    document.documentElement.style.setProperty('--rotate-angle', `${Math.random() * 360}deg`);

    const w = window.innerWidth * 0.2;
    const h = window.innerHeight* 0.2;
    // Set the --x-offset and --y-offset CSS variables to random values between - w/2 and + w/2
    document.documentElement.style.setProperty('--x-offset', `${Math.random() * w - w/2}px`);
    document.documentElement.style.setProperty('--y-offset', `${Math.random() * h - h/2}px`);

    // Set the --flip and --flop CSS variables to either scaleX(-1) or scaleX(1) randomly
    document.documentElement.style.setProperty('--flip', Math.random() < 0.5 ? 'scaleX(-1)' : 'scaleX(1)');
    document.documentElement.style.setProperty('--flop', Math.random() < 0.5 ? 'scaleY(-1)' : 'scaleY(1)');

    drawStars();  // Draw the stars immediately after load

    // Move the stars "soon" after load
    setTimeout(() => {
        startStarMovement();
    }, config.initial_delay * 1000); 
});

window.addEventListener('resize', () => {
    const canvas = document.getElementById('starfield');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawStars();
});
