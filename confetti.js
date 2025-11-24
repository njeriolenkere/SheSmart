// confetti.js

// Function to initialize and start the confetti animation
function initConfetti() {
    // Get the canvas element and its context
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // Array to hold confetti particles
    const confetti = [];

    // Function to create a new confetti particle
    function createConfetti() {
        const colors = ['#ff0', '#0f0', '#00f', '#f00', '#f0f', '#0ff']; // Array of confetti colors
        for (let i = 0; i < 100; i++) { // Create 100 confetti particles
            confetti.push({
                x: Math.random() * canvas.width, // Random x position
                y: Math.random() * canvas.height, // Random y position
                size: Math.random() * 5 + 5, // Random size between 5 and 10
                speedX: Math.random() * 10 - 5, // Random horizontal speed between -5 and 5
                speedY: Math.random() * 10 + 2, // Random vertical speed between 2 and 12
                color: colors[Math.floor(Math.random() * colors.length)] // Random color from the colors array
            });
        }
    }

    // Function to update the position and properties of each confetti particle
    function updateConfetti() {
        for (let i = confetti.length - 1; i >= 0; i--) {
            const particle = confetti[i];
            particle.x += particle.speedX; // Update x position
            particle.y += particle.speedY; // Update y position
            particle.speedY += 0.05; // Increase vertical speed for a falling effect

            // Remove particles that have moved off-screen
            if (particle.y > canvas.height || particle.x < 0 || particle.x > canvas.width) {
                confetti.splice(i, 1); // Remove the particle from the array
            }
        }
    }

    // Function to render the confetti particles
    function renderConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.globalCompositeOperation = 'lighter'; // Make colors blend

        // Draw each confetti particle
        confetti.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); // Draw a circle
            ctx.fillStyle = particle.color;
            ctx.fill();
        });
    }

    // Main animation function
    function animateConfetti() {
        updateConfetti(); // Update particle positions
        renderConfetti(); // Render particles to canvas

        // Continue animation until all particles are gone
        if (confetti.length > 0) {
            requestAnimationFrame(animateConfetti); // Continue animation
        }
    }

    // Initialize the canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create initial confetti particles and start animation
    createConfetti();
    animateConfetti();

    // Function to handle window resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas); // Adjust canvas size on window resize
}

// Ensure that initConfetti() is only called once
let confettiInitialized = false;
function startConfetti() {
    if (!confettiInitialized) {
        initConfetti();
        confettiInitialized = true; // Prevent re-initialization
    }
}
