document.addEventListener('DOMContentLoaded', function() {
    const setupForm = document.getElementById('setup-form');
    const gameContainer = document.getElementById('game-container');
    const gameBoard = document.getElementById('game-board');
    const playerInfo = document.getElementById('player-info');
    const currentTurn = document.getElementById('current-turn');
    const endGame = document.getElementById('end-game');
    const winnerInfo = document.getElementById('winner-info');
    const totalTurns = document.getElementById('total-turns');
    const restartButton = document.getElementById('restart-button');
    const changeDifficultyButton = document.getElementById('change-difficulty');

    let player1, difficulty, currentPlayer, board, turnCount;

    setupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        player1 = document.getElementById('player1').value;
        difficulty = document.getElementById('difficulty').value;

        setupForm.style.display = 'none';
        gameContainer.style.display = 'flex';
        initializeGame();
    });

    changeDifficultyButton.addEventListener('click', function() {
        setupForm.style.display = 'block';
        gameContainer.style.display = 'none';
        endGame.style.display = 'none';
    });

    restartButton.addEventListener('click', function() {
        endGame.style.display = 'none';
        gameContainer.style.display = 'flex';
        initializeGame();
    });

    function initializeGame() {
        currentPlayer = 'P';
        turnCount = 0;
        board = Array.from({ length: 3 }, () => Array(3).fill(null));
        renderBoard();
        updateGameInfo();
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                gameBoard.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (board[row][col] === null) {
            board[row][col] = currentPlayer;
            event.target.textContent = currentPlayer;
            event.target.dataset.player = currentPlayer;
            turnCount++;

            if (checkWin(currentPlayer)) {
                endGame.style.display = 'block';
                winnerInfo.textContent = `${currentPlayer === 'P' ? player1 : 'Machine'} a gagné !`;
                totalTurns.textContent = turnCount;
                return;
            }

            if (turnCount === 9) {
                endGame.style.display = 'block';
                winnerInfo.textContent = 'Match nul !';
                totalTurns.textContent = turnCount;
                return;
            }

            currentPlayer = currentPlayer === 'P' ? 'M' : 'P';
            updateGameInfo();

            if (currentPlayer === 'M') {
                setTimeout(machineMove, 500);
            }
        }
    }

    function machineMove() {
        let move;
        if (difficulty === 'easy') {
            move = getRandomMove();
        } else if (difficulty === 'medium') {
            move = getMediumMove();
        } else {
            move = getHardMove();
        }

        if (move) {
            const [row, col] = move;
            board[row][col] = 'M';
            const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            cell.textContent = 'M';
            cell.dataset.player = 'M';
            turnCount++;

            if (checkWin('M')) {
                endGame.style.display = 'block';
                winnerInfo.textContent = 'Machine a gagné !';
                totalTurns.textContent = turnCount;
                return;
            }

            if (turnCount === 9) {
                endGame.style.display = 'block';
                winnerInfo.textContent = 'Match nul !';
                totalTurns.textContent = turnCount;
                return;
            }

            currentPlayer = 'P';
            updateGameInfo();
        }
    }

    function getRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) {
                    availableMoves.push([i, j]);
                }
            }
        }
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : null;
    }

    function getMediumMove() {
        // Priorité 1: Gagner si possible
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) {
                    board[i][j] = 'M';
                    if (checkWin('M')) {
                        board[i][j] = null;
                        return [i, j];
                    }
                    board[i][j] = null;
                }
            }
        }

        // Priorité 2: Bloquer le joueur seulement dans 50% des cas
        if (Math.random() < 0.5) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = 'P';
                        if (checkWin('P')) {
                            board[i][j] = null;
                            return [i, j];
                        }
                        board[i][j] = null;
                    }
                }
            }
        }

        // Sinon, mouvement aléatoire
        return getRandomMove();
    }

    function getHardMove() {
        let bestMove = null;
        let bestScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) {
                    board[i][j] = 'M';
                    turnCount++;
                    const score = minimax(board, 0, false);
                    board[i][j] = null;
                    turnCount--;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = [i, j];
                    }
                }
            }
        }
        return bestMove;
    }

    function minimax(board, depth, isMaximizing) {
        if (checkWin('M')) return 10 - depth;
        if (checkWin('P')) return depth - 10;
        if (turnCount === 9) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = 'M';
                        turnCount++;
                        const score = minimax(board, depth + 1, false);
                        board[i][j] = null;
                        turnCount--;
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = 'P';
                        turnCount++;
                        const score = minimax(board, depth + 1, true);
                        board[i][j] = null;
                        turnCount--;
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }

    function checkWin(player) {
        // Vérifiez les lignes
        for (let i = 0; i < 3; i++) {
            if (board[i].every(cell => cell === player)) {
                return true;
            }
        }

        // Vérifiez les colonnes
        for (let j = 0; j < 3; j++) {
            if (board.every(row => row[j] === player)) {
                return true;
            }
        }

        // Vérifiez les diagonales
        if (board.every((row, index) => row[index] === player)) {
            return true;
        }
        if (board.every((row, index) => row[2 - index] === player)) {
            return true;
        }

        return false;
    }

    function updateGameInfo() {
        playerInfo.textContent = `Joueur 1: ${player1}`;
        currentTurn.textContent = `Tour actuel: ${currentPlayer === 'P' ? player1 : 'Machine'}`;
    }
});