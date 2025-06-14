// Initialize Kaboom
kaboom({
    width: 800,
    height: 600,
    background: [0, 0, 0],
    scale: 1,
    debug: true,
});

// Set gravity after initialization
setGravity(980);

// Constants
const SPEED = 320;
const JUMP_POWER = 460;
const PLAYER_SIZE = 40;

// Platform positions
const GROUND_Y = 550;
const LEFT_PLATFORM_Y = 400;

// Create player
const player = add([
    pos(50, LEFT_PLATFORM_Y - PLAYER_SIZE),
    rect(PLAYER_SIZE, PLAYER_SIZE),
    area(),
    body(),
    color(0, 255, 180),
    {
        // Custom properties
        playerSpeed: SPEED,
        jumpPower: JUMP_POWER,
        hasJumped: false
    },
    "player"
]);

// Add platforms
function addPlatform(x, y, w) {
    return add([
        pos(x, y),
        rect(w, 20),
        area(),
        body({ isStatic: true }),
        color(255, 255, 255),
        "platform"
    ]);
}

// Create platforms
const platforms = [
    addPlatform(0, GROUND_Y, 800),          // Ground
    addPlatform(50, LEFT_PLATFORM_Y, 200),   // Left platform
    addPlatform(350, 500, 200),             // Middle platform
    addPlatform(600, LEFT_PLATFORM_Y, 200)   // Right platform
];

// Score display
let score = 0;
const scoreLabel = add([
    text(score.toString()),
    pos(24, 24),
    fixed(),
    { value: score }
]);

// Add coins
function addCoin(x, y) {
    return add([
        pos(x, y),
        rect(20, 20),
        area(),
        color(255, 215, 0),
        "coin"
    ]);
}

// Add coins above platforms
addCoin(120, LEFT_PLATFORM_Y - 80);
addCoin(400, 450);
addCoin(650, LEFT_PLATFORM_Y - 80);
addCoin(200, GROUND_Y - 80);
addCoin(500, LEFT_PLATFORM_Y - 120);

// Coin collection
onCollide("player", "coin", (p, coin) => {
    destroy(coin);
    score += 10;
    scoreLabel.text = score.toString();
});

// Add enemy
const enemy = add([
    pos(350, 500 - 40),  // Position enemy on middle platform
    rect(40, 40),
    area(),
    body({ isStatic: false }),  // Make it affected by gravity
    color(255, 0, 0),  // Red color
    {
        moveSpeed: 60,  // Slower speed for testing
        direction: 1,   // 1 for right, -1 for left
        startX: 350,    // Starting X position
        endX: 510      // End X position (platform width - enemy width)
    },
    "enemy"
]);

// Enemy movement
onUpdate("enemy", (e) => {
    // Move enemy left/right
    e.move(e.moveSpeed * e.direction, 0);
    
    // Change direction at platform edges
    if (e.pos.x <= e.startX || e.pos.x >= e.endX) {
        e.direction *= -1;
    }
});

// Player-Enemy collision
onCollide("player", "enemy", (p, e) => {
    // Check if player is above enemy (simple version)
    const playerBottom = p.pos.y + PLAYER_SIZE;
    const enemyTop = e.pos.y;
    
    if (p.pos.y + PLAYER_SIZE <= e.pos.y + 10) {  // Player is on top
        destroy(e);          // Destroy enemy
        p.jump(300);        // Small bounce
        score += 50;        // Add score
        scoreLabel.text = score.toString();
    } else {
        // Player dies
        destroy(p);
        add([
            text("Game Over!\nPress R to restart", { size: 32 }),
            pos(width() / 2, height() / 2),
            anchor("center"),
        ]);
    }
});

// Restart game
onKeyPress("r", () => {
    location.reload();  // Simple restart by reloading the page
});

// Player movement
onKeyDown("left", () => {
    if (player.exists()) {
        player.move(-player.playerSpeed, 0);
    }
});

onKeyDown("right", () => {
    if (player.exists()) {
        player.move(player.playerSpeed, 0);
    }
});

onKeyPress("space", () => {
    if (player.exists() && player.isGrounded()) {
        player.jump(player.jumpPower);
        player.hasJumped = true;
    }
});

onKeyRelease("space", () => {
    if (player.exists()) {
        player.hasJumped = false;
    }
});

// Game loop
onUpdate(() => {
    if (!player.exists()) return;

    // Screen wrap
    if (player.pos.x < 0) {
        player.pos.x = width();
    }
    if (player.pos.x > width()) {
        player.pos.x = 0;
    }
    
    // Respawn if fallen
    if (player.pos.y > height() + 100) {
        player.pos = vec2(50, LEFT_PLATFORM_Y - PLAYER_SIZE);
        player.hasJumped = false;
    }

    // Debug info
    debug.log(`Position: (${Math.floor(player.pos.x)}, ${Math.floor(player.pos.y)})`);
    debug.log(`Grounded: ${player.isGrounded()}`);
    debug.log(`Jump State: ${player.hasJumped}`);
}); 