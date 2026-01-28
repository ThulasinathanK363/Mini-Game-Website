/* ===============================================
   MINI GAMES HUB - GAME LOGIC & NAVIGATION
   =============================================== */

// ========================================
// NAVIGATION SYSTEM
// ========================================

/**
 * Show a specific game screen and hide all others
 * @param {string} gameId - The ID of the game to show
 */
function showGame(gameId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show selected game
    document.getElementById(gameId).classList.add('active');
    
    // Initialize games when shown
    if (gameId === 'ludo') initLudo();
}

/**
 * Return to home screen
 */
function showHome() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById('home').classList.add('active');
}

// ========================================
// GAME 1: SNAKE GAME
// ========================================

let snakeCanvas, snakeCtx;
let snake = [];
let food = {};
let direction = 'RIGHT';
let snakeScore = 0;
let snakeHighScore = 0;
let snakeGameLoop = null;
let snakeGameRunning = false;
const gridSize = 20;
const cellSize = 20;

/**
 * Initialize Snake Game
 */
function initSnakeCanvas() {
    snakeCanvas = document.getElementById('snake-canvas');
    snakeCtx = snakeCanvas.getContext('2d');
    
    // Load high score from localStorage
    snakeHighScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    document.getElementById('snake-high').textContent = snakeHighScore;
}

/**
 * Start Snake Game
 */
function startSnake() {
    if (snakeGameRunning) return;
    
    if (!snakeCanvas) initSnakeCanvas();
    
    // Initialize snake in the middle
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    direction = 'RIGHT';
    snakeScore = 0;
    document.getElementById('snake-score').textContent = snakeScore;
    
    spawnFood();
    snakeGameRunning = true;
    
    // Game loop - 100ms per frame
    snakeGameLoop = setInterval(updateSnake, 100);
}

/**
 * Spawn food at random location
 */
function spawnFood() {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
    
    // Make sure food doesn't spawn on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
        }
    });
}

/**
 * Update snake position and game state
 */
function updateSnake() {
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        document.getElementById('snake-score').textContent = snakeScore;
        
        // Update high score
        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            localStorage.setItem('snakeHighScore', snakeHighScore);
            document.getElementById('snake-high').textContent = snakeHighScore;
        }
        
        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    drawSnake();
}

/**
 * Draw snake and food on canvas
 */
function drawSnake() {
    // Clear canvas
    snakeCtx.fillStyle = '#1a1a2e';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Draw snake
    snakeCtx.fillStyle = '#4ecca3';
    snake.forEach((segment, index) => {
        if (index === 0) {
            snakeCtx.fillStyle = '#45c490'; // Lighter head
        } else {
            snakeCtx.fillStyle = '#4ecca3';
        }
        snakeCtx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 2, cellSize - 2);
    });
    
    // Draw food
    snakeCtx.fillStyle = '#ff6b6b';
    snakeCtx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 2, cellSize - 2);
}

/**
 * Handle game over
 */
function gameOver() {
    clearInterval(snakeGameLoop);
    snakeGameRunning = false;
    alert(`Game Over! Your score: ${snakeScore}`);
}

/**
 * Reset Snake Game
 */
function resetSnake() {
    if (snakeGameLoop) clearInterval(snakeGameLoop);
    snakeGameRunning = false;
    snakeScore = 0;
    document.getElementById('snake-score').textContent = snakeScore;
    
    if (snakeCtx) {
        snakeCtx.fillStyle = '#1a1a2e';
        snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    }
}

// Snake keyboard controls
document.addEventListener('keydown', (e) => {
    if (!snakeGameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'DOWN') direction = 'UP';
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction !== 'UP') direction = 'DOWN';
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction !== 'RIGHT') direction = 'LEFT';
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') direction = 'RIGHT';
            e.preventDefault();
            break;
    }
});

// ========================================
// GAME 2: LUDO (SIMPLIFIED RACE)
// ========================================

let ludoPlayers = [
    { position: 0, color: '🔵', name: 'Player 1' },
    { position: 0, color: '🔴', name: 'Player 2' }
];
let currentPlayer = 0;
let ludoGameActive = false;
const boardSize = 20;

/**
 * Initialize Ludo board
 */
function initLudo() {
    const board = document.getElementById('ludo-board');
    board.innerHTML = '';
    
    // Create 20 cells
    for (let i = 0; i < boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'ludo-cell';
        cell.id = `cell-${i}`;
        
        // Add position number
        if (i === 0) {
            cell.textContent = '🏁';
        } else if (i === boardSize - 1) {
            cell.textContent = '🏆';
        }
        
        board.appendChild(cell);
    }
    
    ludoPlayers = [
        { position: 0, color: '🔵', name: 'Player 1' },
        { position: 0, color: '🔴', name: 'Player 2' }
    ];
    currentPlayer = 0;
    ludoGameActive = true;
    
    updateLudoBoard();
    document.getElementById('ludo-turn').textContent = ludoPlayers[currentPlayer].name;
}

/**
 * Roll dice for Ludo
 */
function rollDice() {
    if (!ludoGameActive) {
        initLudo();
        return;
    }
    
    const dice = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice-value').textContent = dice;
    
    // Animate dice
    const diceEl = document.getElementById('ludo-dice');
    diceEl.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        diceEl.style.transform = 'rotate(0deg)';
    }, 300);
    
    // Move player
    setTimeout(() => {
        movePlayer(dice);
    }, 500);
}

/**
 * Move current player
 */
function movePlayer(steps) {
    ludoPlayers[currentPlayer].position += steps;
    
    // Check win condition
    if (ludoPlayers[currentPlayer].position >= boardSize - 1) {
        ludoPlayers[currentPlayer].position = boardSize - 1;
        updateLudoBoard();
        setTimeout(() => {
            alert(`🎉 ${ludoPlayers[currentPlayer].name} wins!`);
            ludoGameActive = false;
        }, 500);
        return;
    }
    
    updateLudoBoard();
    
    // Switch player
    currentPlayer = (currentPlayer + 1) % 2;
    document.getElementById('ludo-turn').textContent = ludoPlayers[currentPlayer].name;
}

/**
 * Update Ludo board display
 */
function updateLudoBoard() {
    // Clear all cells
    for (let i = 0; i < boardSize; i++) {
        const cell = document.getElementById(`cell-${i}`);
        if (i === 0) {
            cell.textContent = '🏁';
        } else if (i === boardSize - 1) {
            cell.textContent = '🏆';
        } else {
            cell.textContent = '';
        }
        cell.classList.remove('highlight');
    }
    
    // Place players
    ludoPlayers.forEach(player => {
        const cell = document.getElementById(`cell-${player.position}`);
        
        if (player.position === 0) {
            cell.textContent = `🏁${player.color}`;
        } else if (player.position === boardSize - 1) {
            cell.textContent = `${player.color}🏆`;
        } else {
            cell.textContent += player.color;
        }
        
        cell.classList.add('highlight');
    });
}

/**
 * Reset Ludo game
 */
function resetLudo() {
    initLudo();
}

// ========================================
// GAME 3: TIC TAC TOE
// ========================================

let tttBoard = ['', '', '', '', '', '', '', '', ''];
let currentTTTPlayer = 'X';
let tttGameActive = true;

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

/**
 * Make a move in Tic Tac Toe
 */
function makeMove(index) {
    if (!tttGameActive || tttBoard[index] !== '') return;
    
    tttBoard[index] = currentTTTPlayer;
    
    const cells = document.querySelectorAll('.ttt-cell');
    cells[index].textContent = currentTTTPlayer;
    cells[index].classList.add('taken');
    
    // Add color
    cells[index].style.color = currentTTTPlayer === 'X' ? '#4ecca3' : '#f093fb';
    
    // Check win
    if (checkTTTWin()) {
        document.getElementById('ttt-status').textContent = `${currentTTTPlayer} Wins!`;
        tttGameActive = false;
        setTimeout(() => {
            alert(`🎉 Player ${currentTTTPlayer} wins!`);
        }, 300);
        return;
    }
    
    // Check draw
    if (!tttBoard.includes('')) {
        document.getElementById('ttt-status').textContent = 'Draw!';
        tttGameActive = false;
        setTimeout(() => {
            alert("It's a draw!");
        }, 300);
        return;
    }
    
    // Switch player
    currentTTTPlayer = currentTTTPlayer === 'X' ? 'O' : 'X';
    document.getElementById('ttt-player').textContent = currentTTTPlayer;
}

/**
 * Check for Tic Tac Toe win
 */
function checkTTTWin() {
    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return tttBoard[a] !== '' && 
               tttBoard[a] === tttBoard[b] && 
               tttBoard[a] === tttBoard[c];
    });
}

/**
 * Reset Tic Tac Toe
 */
function resetTicTacToe() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    currentTTTPlayer = 'X';
    tttGameActive = true;
    
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
        cell.style.color = '';
    });
    
    document.getElementById('ttt-player').textContent = 'X';
    document.getElementById('ttt-status').textContent = 'Playing';
}

// ========================================
// GAME 4: ROCK PAPER SCISSORS
// ========================================

let rpsScores = {
    player: 0,
    computer: 0,
    ties: 0
};

const rpsChoices = ['rock', 'paper', 'scissors'];
const rpsEmojis = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
};

/**
 * Play Rock Paper Scissors
 */
function playRPS(playerChoice) {
    const computerChoice = rpsChoices[Math.floor(Math.random() * 3)];
    
    // Display choices
    document.getElementById('player-choice-display').textContent = rpsEmojis[playerChoice];
    document.getElementById('computer-choice-display').textContent = rpsEmojis[computerChoice];
    
    // Determine winner
    let result = '';
    
    if (playerChoice === computerChoice) {
        result = "It's a tie!";
        rpsScores.ties++;
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        result = '🎉 You win!';
        rpsScores.player++;
    } else {
        result = '😔 Computer wins!';
        rpsScores.computer++;
    }
    
    // Update display
    document.getElementById('result-text').textContent = result;
    document.getElementById('rps-player-score').textContent = rpsScores.player;
    document.getElementById('rps-computer-score').textContent = rpsScores.computer;
    document.getElementById('rps-ties').textContent = rpsScores.ties;
}

/**
 * Reset Rock Paper Scissors scores
 */
function resetRPS() {
    rpsScores = {
        player: 0,
        computer: 0,
        ties: 0
    };
    
    document.getElementById('rps-player-score').textContent = 0;
    document.getElementById('rps-computer-score').textContent = 0;
    document.getElementById('rps-ties').textContent = 0;
    document.getElementById('player-choice-display').textContent = '?';
    document.getElementById('computer-choice-display').textContent = '?';
    document.getElementById('result-text').textContent = 'Make your choice!';
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('🎮 Mini Games Hub loaded successfully!');
});
