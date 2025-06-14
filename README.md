# Simple Platform Game

A basic platformer game created with Kaboom.js where you control a square that can move and jump between platforms, collect coins, and battle enemies.

## How to Run

1. Open the `index.html` file in a modern web browser
2. The game should start automatically

## How to Play

- Use the **Left Arrow** key to move left
- Use the **Right Arrow** key to move right
- Press **Space** to jump
- Collect gold coins to earn 10 points each
- Jump on enemies from above to defeat them and earn 50 points
- Avoid touching enemies from the sides or below
- If you fall off the platforms, you'll respawn at the starting position
- You can wrap around the screen by going off the left or right edges
- Press **R** to restart if you die

## Features

- Simple square-based graphics
- Platform collision detection
- Basic physics (gravity and jumping)
- Screen wrapping
- Auto-respawn when falling
- Dynamic enemy system:
  - Enemies patrol platforms
  - New enemies spawn periodically (up to 5 maximum)
  - Enemies maintain safe distances from each other
  - Defeat enemies by jumping on them
- Coin collection system:
  - Coins respawn automatically
  - Maximum of 5 coins at a time
  - Coins spawn in safe locations away from enemies
  - Visual effects for coin collection
- Scoring system:
  - 10 points per coin
  - 50 points per defeated enemy
  - Score display in top-left corner
- Visual feedback:
  - Point popups when collecting coins or defeating enemies
  - Spawn effects for new enemies and coins
  - Game over screen with restart option 