// script.js

let player1, player2, gridSize, currentPlayer, board, turnCount;

document.getElementById('setup-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Récupérer les valeurs du formulaire
    player1 = document.getElementById('player1').value;
    player2 = "Machine"; // La machine est le deuxième joueur
    gridSize = parseInt(document.getElementById('grid-size').value);

    // Initialiser le jeu
    initializeGame();
});

function initializeGame() {
    currentPlayer = player1; // Le joueur commence toujours
    turnCount = 0;
    board = Array(gridSize * gridSize).fill(null); // Tableau pour représenter la grille

    // Masquer le formulaire et afficher le jeu
    document.getElementById('setup-form').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';

    // Mettre à jour les informations du jeu
    document.getElementById('player-info').textContent = `Joueur 1 : ${player1} | Joueur 2 : ${player2}`;
    document.getElementById('grid-info').textContent = `Dimension : ${gridSize}x${gridSize}`;
    document.getElementById('current-turn').textContent = `Tour de : ${currentPlayer}`;

    // Générer la grille de jeu
    generateBoard();
}

function generateBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Vider la grille existante
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`; // Ajuster la taille de la grille

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i; // Stocker l'index de la cellule
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const index = cell.dataset.index;

    // Vérifier si la cellule est déjà occupée
    if (board[index] !== null) return;

    // Jouer le coup du joueur
    board[index] = 'P'; // Le joueur utilise 'P'
    cell.textContent = 'P';
    cell.style.pointerEvents = 'none'; // Désactiver les clics sur cette cellule
    turnCount++;

    // Vérifier si le joueur a gagné
    if (checkWin('P')) {
        endGame(`${player1} a gagné !`);
        return;
    }

    // Vérifier s'il y a un match nul
    if (turnCount === gridSize * gridSize) {
        endGame('Match nul !');
        return;
    }

    // Passer au tour de la machine
    currentPlayer = player2;
    document.getElementById('current-turn').textContent = `Tour de : ${currentPlayer}`;
    setTimeout(machinePlay, 500); // La machine joue après un délai de 500ms
}

function machinePlay() {
    // Trouver le meilleur coup pour la machine
    const bestMove = findBestMove();

    // Jouer le coup de la machine
    board[bestMove] = 'M'; // La machine utilise 'M'
    const cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
    cell.textContent = 'M';
    cell.style.pointerEvents = 'none'; // Désactiver les clics sur cette cellule
    turnCount++;

    // Vérifier si la machine a gagné
    if (checkWin('M')) {
        endGame(`${player2} a gagné !`);
        return;
    }

    // Vérifier s'il y a un match nul
    if (turnCount === gridSize * gridSize) {
        endGame('Match nul !');
        return;
    }

    // Revenir au tour du joueur
    currentPlayer = player1;
    document.getElementById('current-turn').textContent = `Tour de : ${currentPlayer}`;
}

function findBestMove() {
    // Priorité 1 : La machine gagne si possible
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = 'M';
            if (checkWin('M')) {
                board[i] = null; // Annuler le coup
                return i;
            }
            board[i] = null;
        }
    }

    // Priorité 2 : Bloquer le joueur s'il est sur le point de gagner
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = 'P';
            if (checkWin('P')) {
                board[i] = null; // Annuler le coup
                return i;
            }
            board[i] = null;
        }
    }

    // Priorité 3 : Choisir une cellule vide au hasard
    const emptyCells = board.map((value, index) => value === null ? index : null).filter(val => val !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function checkWin(symbol) {
    // Vérifier les lignes, colonnes et diagonales pour une victoire
    const winningCombinations = getWinningCombinations();

    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === symbol);
    });
}

function getWinningCombinations() {
    const combinations = [];

    // Lignes
    for (let i = 0; i < gridSize; i++) {
        combinations.push(Array.from({ length: gridSize }, (_, j) => i * gridSize + j));
    }

    // Colonnes
    for (let i = 0; i < gridSize; i++) {
        combinations.push(Array.from({ length: gridSize }, (_, j) => j * gridSize + i));
    }

    // Diagonales
    combinations.push(Array.from({ length: gridSize }, (_, i) => i * gridSize + i));
    combinations.push(Array.from({ length: gridSize }, (_, i) => i * gridSize + (gridSize - 1 - i)));

    return combinations;
}

function endGame(message) {
    document.getElementById('winner-info').textContent = message;
    document.getElementById('total-turns').textContent = turnCount;
    document.getElementById('end-game').style.display = 'block';
    document.getElementById('game-board').style.pointerEvents = 'none'; // Désactiver la grille
}

function restartGame() {
    document.getElementById('setup-form').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('end-game').style.display = 'none';
    document.getElementById('setup-form').reset();
}