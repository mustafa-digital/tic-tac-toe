const TOP = 0;
const MIDDLE = 1;
const BOTTOM = 2;
const LEFT = 0;
const RIGHT = 2;
const MAX_GAME_TURNS = 9;
const GAME_DRAW = 1;
const GAME_NOT_OVER = 0;
const GAME_WIN = 2;

const gameBoard = (function () {
    const gameArray = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];

    const displayGameBoard = () => {
        console.log(gameArray);
    };

    const placeMarker = (positionX, positionY, player) => {
        if (gameArray[positionX][positionY] !== 0) {
            throw new Error("Marker already exists at this location.");
        }

        console.log(
            `Placing marker on game board at ${positionX},${positionY}`,
        );
        gameArray[positionX][positionY] = player.getPlayerMarker();
    };

    const getGameBoard = () => gameArray.map((arr) => arr.slice());

    return { displayGameBoard, placeMarker, getGameBoard };
})();

function createPlayer(playerNum) {
    const id = playerNum;
    const marker = id === 1 ? "o" : "x";

    const getPlayerID = () => id;
    const getPlayerMarker = () => marker;

    return { getPlayerID, getPlayerMarker };
}

const gameLogic = (function () {
    let currentPlayer;
    let player1;
    let player2;
    let gameOver = false;
    let winner = null;
    let gameTurn = 0;
    let gameResult = 0;

    const setPlayers = (p1, p2) => {
        player1 = p1;
        player2 = p2;

        currentPlayer = player1;
    };

    const getPlayerTurn = () => currentPlayer;

    const setCurrentPlayer = (player) => {
        currentPlayer = player;
        console.log(`current player turn is: ${player.getPlayerID()}`);
    };

    const getGameOver = () => gameOver;

    const getGameOverMessage = () => {
        if (gameResult === GAME_DRAW) {
            console.log("This game has ended in a draw!");
        }
        if (gameResult === GAME_WIN) {
            console.log(`The winner is Player ${winner.getPlayerID()}!`);
        }
    };

    const setWinner = (player) => {
        winner = player;
    };

    const getWinner = () => winner;

    const switchPlayerTurn = () => {
        console.log(
            `switching player turn from ${currentPlayer.getPlayerID()}`,
        );
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        console.log(
            `now current player turn is: ${currentPlayer.getPlayerID()}`,
        );
    };

    const playTurn = () => {
        alert(`Player ${currentPlayer.getPlayerID()}, choose a spot to mark`);
        const positionX = Number(prompt("X"));
        const positionY = Number(prompt("Y"));

        gameBoard.placeMarker(positionX, positionY, currentPlayer);
        gameBoard.displayGameBoard();
        gameTurn += 1;
        gameResult = checkGameOverState(positionX, positionY);

        if (gameResult === GAME_DRAW || gameResult === GAME_WIN)
            gameOver = true;
    };

    const checkGameOverState = (positionX, positionY) => {
        if (gameTurn === MAX_GAME_TURNS) {
            return GAME_DRAW;
        }

        const board = gameBoard.getGameBoard();

        // check horizontal
        let horizontal = board[positionX];
        horizontal = horizontal.filter(
            (marker) => marker === board[positionX][positionY],
        );
        if (horizontal.length === 3) {
            setWinner(currentPlayer);
            return GAME_WIN;
        }

        let vertical = [
            board[0][positionY],
            board[1][positionY],
            board[2][positionY],
        ];

        vertical = vertical.filter(
            (marker) => marker === board[positionX][positionY],
        );
        if (vertical.length === 3) {
            setWinner(currentPlayer);
            return GAME_WIN;
        }

        // check if marker was placed on a corner spot or middle, if yes, check diagonals for three matching
        if (
            (positionX === 0 && positionY === 0) || // top left corner
            (positionX === 2 && positionY === 2) || // bottom right corner
            (positionX === 1 && positionY === 1) // middle spot
        ) {
            // check top left - bottom right
            let diagonal = [board[0][0], board[1][1], board[2][2]];
            diagonal = diagonal.filter(
                (marker) => marker === board[positionX][positionY],
            );
            if (diagonal.length === 3) {
                setWinner(currentPlayer);
                return GAME_WIN;
            }
        } else if (
            (positionX === 0 && positionY === 2) || // top right corner
            (positionX === 2 && positionY === 0) || // bottom left corner
            (positionX === 1 && positionY === 1) // middle spot
        ) {
            // check top right - bottom left
            let diagonal = [board[0][2], board[1][1], board[2][0]];
            diagonal = diagonal.filter(
                (marker) => marker === board[positionX][positionY],
            );
            if (diagonal.length === 3) {
                setWinner(currentPlayer);
                return GAME_WIN;
            }
        }
        return GAME_NOT_OVER;
    };

    return {
        getPlayerTurn,
        setCurrentPlayer,
        getGameOver,
        getGameOverMessage,
        checkGameOverState,
        playTurn,
        switchPlayerTurn,
        setPlayers,
        getWinner,
    };
})();

const gameLoop = (function () {
    const gameWinner = null;

    const startGame = () => {
        console.log("initializing game...");
        const player1 = createPlayer(1);
        const player2 = createPlayer(2);
        gameLogic.setPlayers(player1, player2);
        console.log("set players...");
        runGame();
    };

    const runGame = () => {
        while (gameLogic.getGameOver() === false) {
            gameLogic.playTurn();
            gameLogic.switchPlayerTurn();
        }
        gameLogic.getGameOverMessage();
    };

    return { startGame };
})();

document.addEventListener("DOMContentLoaded", () => {
    gameLoop.startGame();
});
