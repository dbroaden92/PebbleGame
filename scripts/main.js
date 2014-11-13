var PLAYER_A = 'A';
var PLAYER_B = 'B';
var board = {
    A: [],
    B: [],
    turn: 0
};
var winner = null;

function loadDefault() {
    board = createBoard();
    winner = null;
    displayBoard();
}

function createBoard(numCol, initVal, turn) {
    numCol = numCol || 2;
    initVal = initVal || 2;
    turn = turn || PLAYER_A;

    var newBoard = {};
    newBoard.A = [];
    newBoard.B = [];
    newBoard.turn = turn;
    for (var i = 0; i < numCol; i++) {
        newBoard.A.push(initVal);
        newBoard.B.push(initVal);
    }

    return newBoard;
}

function displayBoard() {
    var boardContainer = document.getElementById('board');
    var boardTable = document.createElement('table');
    var aRow = document.createElement('tr');
    var bRow = document.createElement('tr');

    boardTable.border = 1;
    boardTable.padding = 0;
    boardTable.margin = 0;

    for (var i = 0; i < board.A.length; i++) {
        var aTd = document.createElement('td');
        var bTd = document.createElement('td');
        var button = document.createElement('button');
        button.value = i;
        button.onclick = function() {
            move(this.value);
        };
        if (checkWinner()) {
            aTd.appendChild(document.createTextNode(board.A[i]));
            aTd.align = 'center';
            bTd.appendChild(document.createTextNode(board.B[i]));
            bTd.align = 'center';
        } else if (board.turn == PLAYER_A) {
            if (board.A[i] > 0) {
                button.innerHTML = board.A[i];
                aTd.appendChild(button);
            } else {
                aTd.appendChild(document.createTextNode(board.A[i]));
                aTd.align = 'center';
            }
            bTd.appendChild(document.createTextNode(board.B[i]));
            bTd.align = 'center';
        } else {
            if (board.B[i] > 0) {
                button.innerHTML = board.B[i];
                bTd.appendChild(button);
            } else {
                bTd.appendChild(document.createTextNode(board.B[i]));
                bTd.align = 'center';
            }
            aTd.appendChild(document.createTextNode(board.A[i]));
            aTd.align = 'center';
        }
        aRow.appendChild(aTd);
        bRow.appendChild(bTd);
    }

    boardTable.appendChild(aRow);
    boardTable.appendChild(bRow);
    while (boardContainer.firstChild) {
        boardContainer.removeChild(boardContainer.firstChild);
    }
    boardContainer.appendChild(boardTable);
}

function move(index) {
    var player = board.turn;
    var value = 0;
    if (board.turn == PLAYER_A) {
        value = board.A[index];
        board.A[index] = 0;
        if (index < board.A.length - 1) {
            index++;
        } else {
            player = PLAYER_B;
        }
        board.turn = PLAYER_B;
    } else {
        value = board.B[index];
        board.B[index] = 0;
        if (index > 0) {
            index--;
        } else {
            player = PLAYER_A;
        }
        board.turn = PLAYER_A;
    }

    distribute(player, index, value);
    displayBoard();
}

function distribute(player, index, value) {
    if (value > 0) {
        value--;
        if (player == PLAYER_A) {
            board.A[index]++;
            if (index < board.A.length - 1) {
                index++;
            } else {
                player = PLAYER_B;
            }
        } else {
            board.B[index]++;
            if (index > 0) {
                index--;
            } else {
                player = PLAYER_A;
            }
        }
        distribute(player, index, value);
    }
}

function checkWinner() {
    var aSum = 0;
    for (var i = 0; i < board.A.length; i++) {
        aSum += board.A[i];
    }
    if (aSum == 0) {
        winner = PLAYER_B;
    } else {
        var bSum = 0;
        for (var i = 0; i < board.B.length; i++) {
            bSum += board.B[i];
        }
        if (bSum == 0) {
            winner = PLAYER_A;
        }
    }
    var winElement = document.getElementById('winner');
    if (winner) {
        if (winner == PLAYER_A) {
            winElement.innerHTML = 'Player A Wins!';
        } else {
            winElement.innerHTML = 'Player B Wins!';
        }
        return true;
    } else {
        winElement.innerHTML = '';
    }
    return false;
}
