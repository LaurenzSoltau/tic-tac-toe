// Gameboard Object
// store gameboard as array of cells
// interface for getting board, printing board and making a move

// cell object
// store the current state of the cell
// interface for setting and getting the value in the cell

// gameController Object
// takes players
// stores players, active player
// switching turn
// playing round
// print new round
// interface for plazing round, getting active player and getting the board

const gameBoard = (function () {
    board = [];

    const populateBoard = () => {
        for (let i = 0; i < 9; i++) {
            board[i] = Cell();
        }
    };

    populateBoard();

    const resetBoard = () => {
        populateBoard();
    };

    const getBoard = () => board;

    const placeMove = (cellIndex, playerValue) => {
        if (board[cellIndex].getValue() != " ") return false;
        board[cellIndex].changeCell(playerValue);
        return true;
    };

    const checkForWinningRow = () => {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],

            [0, 4, 8],
            [2, 4, 6],
        ];

        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (
                board[a].getValue() != " " &&
                board[a].getValue() === board[b].getValue() &&
                board[a].getValue() === board[c].getValue() &&
                board[b].getValue() === board[c].getValue()
            ) {
                return true;
            }
        }
        return false;
    };

    const checkForDraw = () => {
        for (let cell of board) {
            if (cell.getValue() === " ") return false;
        }
        return true;
    };

    return {
        getBoard,
        placeMove,
        checkForWinningRow,
        checkForDraw,
        resetBoard,
    };
})();

function Cell() {
    let value = " ";

    const changeCell = (player) => {
        value = player;
    };

    const getValue = () => value;

    return { changeCell, getValue };
}

const gameController = (function () {
    const board = gameBoard;
    const roundCounter = counter();
    roundCounter.increment();
    const players = [
        {
            name: "Player 1",
            value: "X",
            index: 1,
            score: counter(),
        },

        {
            name: "Player 2",
            value: "O",
            index: 2,
            score: counter(),
        },
    ];

    let activePlayer = players[0];

    const resetGame = () => {
        roundCounter.reset();
        roundCounter.increment();
        board.resetBoard();
        activePlayer = players[0];
        players[0].name = "Player 1";
        players[0].score.reset();
        players[1].name = "Player 2";
        players[1].score.reset();
    };

    const getActivePlayer = () => activePlayer;

    const switchActivePlayer = () => {
        activePlayer =
            getActivePlayer() === players[0] ? players[1] : players[0];
    };

    const playRound = (cellIndex) => {
        console.log(
            `Placing ${
                getActivePlayer().name
            }'s Symbol into Cell ${cellIndex}...`
        );
        if (!board.placeMove(cellIndex, getActivePlayer().value)) {
            console.log("Invalid Move");
            return;
        }

        if (board.checkForWinningRow()) {
            console.log(
                `${getActivePlayer().name} with the symbol ${
                    getActivePlayer().value
                } won the game!`
            );
            activePlayer.score.increment();
            reset();
            return;
        }

        if (board.checkForDraw()) {
            players[0].score.increment();
            players[1].score.increment();
            reset();
            return;
        }

        switchActivePlayer();
    };

    const reset = () => {
        gameBoard.resetBoard();
        roundCounter.increment();
        activePlayer = players[0];
    };

    const getRoundCount = () => roundCounter.getCount();

    const getPlayerScore = (playerIndex) =>
        players[playerIndex].score.getCount();

    const changePlayerName = (player, newName) => {
        players[player].name = newName;
    }

    const getPlayerName = (playerIndex) => players[playerIndex].name;

    return {
        playRound,
        getActivePlayer,
        resetGame,
        getBoard: board.getBoard,
        getPlayerScore,
        getRoundCount,
        changePlayerName,
        getPlayerName,
    };
})();

function counter() {
    let counter = 0;
    const increment = () => counter++;
    const reset = () => (counter = 0);
    const getCount = () => counter;

    return {
        increment,
        reset,
        getCount,
    };
}

const displayController = (function () {
    const boardContainerDiv = document.querySelector(".board-container");
    const playerCardOne = document.querySelector("#player1");
    const playerCardTwo = document.querySelector("#player2");
    const playerScoreOne = playerCardOne.children[2];
    const playerScoreTwo = playerCardTwo.children[2];
    const playerNameOne = playerCardOne.children[0];
    const playerNameTwo = playerCardTwo.children[0];
    const roundContainer = document.querySelector(".round-container");
    const restartButton = document.querySelector(".game-section>button");
    const dialog = document.querySelector("dialog");
    const form = dialog.querySelector("form");

    const updateScreen = () => {
        boardContainerDiv.textContent = "";

        const board = gameController.getBoard();
        const activePlayer = gameController.getActivePlayer();
        if (activePlayer.index === 1) {
            playerCardOne.classList.toggle("active", true);
            playerCardTwo.classList.toggle("active", false);
        } else {
            playerCardOne.classList.toggle("active", false);
            playerCardTwo.classList.toggle("active", true);
        }

        board.forEach((cell, index) => {
            const cellButton = document.createElement("button");
            cellButton.classList.add("cell");
            cellButton.dataset.index = index;
            cellButton.textContent = cell.getValue();
            boardContainerDiv.appendChild(cellButton);
        });

        playerScoreOne.textContent = gameController.getPlayerScore(0);
        playerScoreTwo.textContent = gameController.getPlayerScore(1);
        playerNameOne.textContent = gameController.getPlayerName(0);
        playerNameTwo.textContent = gameController.getPlayerName(1);

        roundContainer.textContent = "Round " + gameController.getRoundCount();
    };

    function handleClickBoard(e) {
        const selectedIndex = e.target.dataset.index;
        if (!selectedIndex) return;

        gameController.playRound(selectedIndex);
        updateScreen();
    }
    boardContainerDiv.addEventListener("click", handleClickBoard);
    restartButton.addEventListener("click", () => {
        gameController.resetGame();
        updateScreen();
    });

    let activePlayerCardIndex = null;

    function handlePlayerCardClicked(e) {
        const input = dialog.querySelector("input");
        activePlayerCardIndex = e.target.closest(".player-card").dataset.index;
        input.value = gameController.getPlayerName(activePlayerCardIndex);
        dialog.showModal();
    }

    playerCardOne.addEventListener("click", handlePlayerCardClicked); 
    playerCardTwo.addEventListener("click", handlePlayerCardClicked);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newName = formData.get("name");
        gameController.changePlayerName(activePlayerCardIndex, newName);
        dialog.close();
        updateScreen();
    })

    updateScreen();
})();
