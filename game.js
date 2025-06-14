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

// Constants for safe distances
const MIN_ENEMY_DISTANCE = 120;   // Minimum distance between enemies
const MIN_PLAYER_DISTANCE = 200;  // Minimum distance from player
const MIN_COIN_DISTANCE = 80;     // Minimum distance between coins
const COIN_SPAWN_INTERVAL = 3;    // Spawn new coin every 3 seconds
const MAX_COINS = 5;              // Maximum number of coins at once

// Coin spawn points (above platforms)
const COIN_SPAWN_POINTS = [
    { x: 120, y: LEFT_PLATFORM_Y - 80 },
    { x: 400, y: 450 },
    { x: 650, y: LEFT_PLATFORM_Y - 80 },
    { x: 200, y: GROUND_Y - 80 },
    { x: 500, y: LEFT_PLATFORM_Y - 120 },
    { x: 300, y: GROUND_Y - 120 },
    { x: 700, y: GROUND_Y - 80 },
    { x: 100, y: 500 - 80 }  // Above middle platform
];

// Check if a position is safe for coins
function isSafeCoinPosition(pos) {
    // Check distance from other coins
    const coins = get("coin");
    for (const coin of coins) {
        if (getDistance(pos, coin.pos) < MIN_COIN_DISTANCE) {
            return false;
        }
    }

    // Check distance from enemies (coins shouldn't spawn right on enemies)
    const enemies = get("enemy");
    for (const enemy of enemies) {
        if (getDistance(pos, enemy.pos) < MIN_ENEMY_DISTANCE * 0.5) {
            return false;
        }
    }

    return true;
}

// Coin creation function with safe spawning
function spawnCoin() {
    let attempts = 0;
    let spawnPoint;
    const MAX_ATTEMPTS = 10;

    while (attempts < MAX_ATTEMPTS) {
        spawnPoint = COIN_SPAWN_POINTS[Math.floor(Math.random() * COIN_SPAWN_POINTS.length)];
        
        if (isSafeCoinPosition(spawnPoint)) {
            break;
        }
        
        attempts++;
    }

    if (attempts >= MAX_ATTEMPTS) {
        debug.log("Could not find safe coin spawn position");
        return null;
    }

    return add([
        pos(spawnPoint.x, spawnPoint.y),
        rect(20, 20),
        area(),
        color(255, 215, 0),
        {
            spawnTime: time()  // Track when the coin was spawned
        },
        "coin"
    ]);
}

// Initialize coins
function initializeCoins() {
    // Clear any existing coins
    get("coin").forEach(coin => destroy(coin));
    
    // Spawn initial coins
    for (let i = 0; i < MAX_COINS; i++) {
        spawnCoin();
    }
}

// Initialize coins at start
initializeCoins();

let coinSpawnTimer = 0;

// Enemy spawn points (platform positions)
const SPAWN_POINTS = [
    { x: 350, y: 500 - 40 },    // Middle platform
    { x: 600, y: LEFT_PLATFORM_Y - 40 },  // Right platform
    { x: 50, y: LEFT_PLATFORM_Y - 40 }    // Left platform
];

// Helper function to calculate distance between two points
function getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Check if a position is safe (far enough from other entities)
function isSafePosition(pos) {
    // Check distance from player
    if (player.exists()) {
        if (getDistance(pos, player.pos) < MIN_PLAYER_DISTANCE) {
            return false;
        }
    }

    // Check distance from other enemies
    const enemies = get("enemy");
    for (const enemy of enemies) {
        if (getDistance(pos, enemy.pos) < MIN_ENEMY_DISTANCE) {
            return false;
        }
    }

    return true;
}

// Enemy creation function
function spawnEnemy() {
    // Try to find a safe spawn point
    let attempts = 0;
    let spawnPoint;
    const MAX_ATTEMPTS = 10;  // Maximum number of attempts to find a safe position

    while (attempts < MAX_ATTEMPTS) {
        // Randomly select a spawn point
        spawnPoint = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
        
        // Check if this position is safe
        if (isSafePosition(spawnPoint)) {
            break;
        }
        
        attempts++;
    }

    // If we couldn't find a safe position after max attempts, don't spawn
    if (attempts >= MAX_ATTEMPTS) {
        debug.log("Could not find safe spawn position");
        return null;
    }

    const enemy = add([
        pos(spawnPoint.x, spawnPoint.y),
        rect(40, 40),
        area(),
        body({ isStatic: false }),
        color(255, 0, 0),
        {
            moveSpeed: 60,
            direction: 1,
            startX: spawnPoint.x,
            endX: spawnPoint.x + 160
        },
        "enemy"
    ]);

    return enemy;
}

// Initial enemies
spawnEnemy();
spawnEnemy();

// Spawn timer
let timeSinceLastSpawn = 0;
const SPAWN_INTERVAL = 5;  // Spawn new enemy every 5 seconds
const MAX_ENEMIES = 5;     // Maximum number of enemies allowed at once

// Enemy movement and spawn logic in game loop
onUpdate(() => {
    // Update enemies
    get("enemy").forEach((e) => {
        // Move enemy left/right
        e.move(e.moveSpeed * e.direction, 0);
        
        // Change direction at platform edges
        if (e.pos.x <= e.startX || e.pos.x >= e.endX) {
            e.direction *= -1;
        }
    });

    // Enemy spawning logic
    timeSinceLastSpawn += dt();
    if (timeSinceLastSpawn >= SPAWN_INTERVAL) {
        const currentEnemies = get("enemy").length;
        if (currentEnemies < MAX_ENEMIES) {
            const newEnemy = spawnEnemy();
            if (newEnemy) {
                // Add visual feedback for spawn
                add([
                    pos(width() / 2, height() / 2),
                    text("New Enemy Spawned!", { size: 24 }),
                    color(255, 0, 0),
                    lifespan(1),
                    fixed()
                ]);
            }
        }
        timeSinceLastSpawn = 0;
    }

    // Coin spawning logic
    coinSpawnTimer += dt();
    if (coinSpawnTimer >= COIN_SPAWN_INTERVAL) {
        const currentCoins = get("coin").length;
        if (currentCoins < MAX_COINS) {
            const newCoin = spawnCoin();
            if (newCoin) {
                // Simple spawn effect using a circle
                add([
                    pos(newCoin.pos),
                    circle(15),
                    color(255, 255, 0),
                    opacity(0.7),
                    lifespan(0.3),
                    scale(1)
                ]);
            }
        }
        coinSpawnTimer = 0;
    }

    // Debug info for distances
    if (debug.inspect) {
        const enemies = get("enemy");
        enemies.forEach((enemy) => {
            if (player.exists()) {
                debug.log(`Distance to player: ${Math.floor(getDistance(enemy.pos, player.pos))}`);
            }
        });
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
        
        // Spawn effect
        add([
            text("+50", { size: 16 }),
            pos(e.pos.x, e.pos.y),
            color(255, 215, 0),  // Gold color
            lifespan(0.5),
            move(UP, 100)
        ]);
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