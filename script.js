const positionObj = {
    top: 0,
    center: 1,
    bottom: 2,
    left: 0,
    middle: 1,
    right: 2,
};
const MAX_GAME_TURNS = 9;
const GAME_DRAW = 1;
const GAME_NOT_OVER = 0;
const GAME_WIN = 2;

const gameBoard = (function () {
    let gameArray = [
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

    const resetGameBoard = () => {
        gameArray = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        // gameArray.forEach((row) => {
        //     row.forEach((square) => {
        //         square = 0;
        //     });
        // });
    };

    return { displayGameBoard, placeMarker, getGameBoard, resetGameBoard };
})();

function createPlayer(playerNum) {
    const id = playerNum;
    const marker = id === 1 ? "O" : "X";

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

    const setPlayers = () => {
        player1 = createPlayer(1);
        player2 = createPlayer(2);

        currentPlayer = player1;
    };

    const getCurrentPlayer = () => currentPlayer;

    const getGameOver = () => gameOver;

    const gameOverMessage = () => {
        if (gameResult === GAME_DRAW) {
            return "This game has ended in a draw!";
        }
        if (gameResult === GAME_WIN) {
            return `The winner is Player ${winner.getPlayerID()}!`;
        }
    };

    const setWinner = (player) => {
        winner = player;
    };

    const switchPlayerTurn = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const playTurn = (positionX, positionY) => {
        gameBoard.placeMarker(positionX, positionY, currentPlayer);
        gameTurn += 1;
        gameResult = checkGameOverState(positionX, positionY);

        if (gameResult === GAME_DRAW || gameResult === GAME_WIN) {
            gameOver = true;
            gameOverMessage();
            displayController.gameOverRemoveClickEvents();
            setTimeout(displayController.addResetEvent, 2000);
        } else {
            switchPlayerTurn();
        }
        displayController.updateTurnTip(gameOver);
    };

    const checkGameOverState = (positionX, positionY) => {
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
        if (gameTurn === MAX_GAME_TURNS) {
            return GAME_DRAW;
        }

        return GAME_NOT_OVER;
    };

    const resetGame = () => {
        switchPlayerTurn();
        gameOver = false;
        winner = null;
        gameTurn = 0;
        gameResult = 0;

        gameBoard.resetGameBoard();
        displayController.removeResetEvent();
        displayController.resetGrid();
        displayController.updateTurnTip();
        displayController.setupGameBoard();
    };

    return {
        getCurrentPlayer,
        getGameOver,
        checkGameOverState,
        playTurn,
        resetGame,
        switchPlayerTurn,
        setPlayers,
        gameOverMessage,
    };
})();

const displayController = (function () {
    let gameGrid;
    let gridSquares;
    const gridSquaresClickEvent = (event) => {
        const currentPlayer = gameLogic.getCurrentPlayer();
        const currentPlayerMarker = currentPlayer.getPlayerMarker();
        event.target.classList.add(currentPlayerMarker);

        sendPositionsToGameLogic(event.target);
    };

    const gameOverRemoveClickEvents = () => {
        for (let i = 0; i < gridSquares.length; i++) {
            gridSquares[i].removeEventListener("click", gridSquaresClickEvent);
        }
    };

    const sendPositionsToGameLogic = (gridSquare) => {
        const classList = Array.from(gridSquare.classList);
        const positionX = positionObj[classList[1]];
        const positionY = positionObj[classList[2]];

        gameLogic.playTurn(positionX, positionY);
    };

    const setupGameBoard = () => {
        gameGrid = document.querySelector(".game-grid");
        gridSquares = gameGrid.getElementsByClassName("grid-square");
        for (let i = 0; i < gridSquares.length; i++) {
            gridSquares[i].addEventListener("click", gridSquaresClickEvent);
        }
    };

    const resetGrid = () => {
        for (let i = 0; i < gridSquares.length; i++) {
            gridSquares[i].classList.remove("X");
            gridSquares[i].classList.remove("O");
        }
    };

    const addResetEvent = () => {
        gameGrid.addEventListener("click", gameLogic.resetGame);
    };

    const removeResetEvent = () => {
        gameGrid.removeEventListener("click", gameLogic.resetGame);
    };

    const updateTurnTip = (isGameOver) => {
        const tipSpan = document.querySelector(".game-turn-tip");

        if (isGameOver) {
            tipSpan.textContent = gameLogic.gameOverMessage();
        } else {
            tipSpan.textContent = `Player ${gameLogic
                .getCurrentPlayer()
                .getPlayerID()}'s turn`;
        }
    };

    return {
        setupGameBoard,
        gameOverRemoveClickEvents,
        addResetEvent,
        removeResetEvent,
        resetGrid,
        updateTurnTip,
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    gameLogic.setPlayers();
    displayController.setupGameBoard();
});
