var PLAYER_A = 'A';
var PLAYER_B = 'B';
var board = {
    A: [],
    B: [],
    turn: PLAYER_A,
    prev: -1
};
var plys = 2;
var mode = 0;
var delay = 1200; // in millis
var auto = true;
var winner = null;
var timeout = null;
var running = false;

function cloneBoard(gameBoard) {
    var newBoard = {
        A:[],
        B:[],
        turn: PLAYER_B,
        prev: -1
    };
    newBoard.A = cloneList(gameBoard.A);
    newBoard.B = cloneList(gameBoard.B);
    if (gameBoard.turn == PLAYER_A) {
        newBoard.turn = PLAYER_A;
    }
    newBoard.prev = gameBoard.prev;
    return newBoard;
}

function cloneList(list) {
    var newList = [];
    for (var i = 0; i < list.length; i++) {
        newList.push(list[i]);
    }
    return newList;
}

function setDelay(newDelay) {
    newDelay = newDelay || document.getElementById('stepdelay').value || 1200;
    if (newDelay < 200) {
        delay = 200;
    } else if (newDelay > 2200) {
        delay = 2200;
    } else {
        delay = newDelay;
    }
}

function setAuto(newAuto) {
    newAuto = newAuto || document.getElementById('autoplay').value || 0;
    if (newAuto == 0) {
        auto = true;
    } else {
        auto = false;
    }
}

function newGame(numCol, initVal, lookahead, turn, gameMode, stepDelay, autoplay) {
    pause();
    numCol = numCol || document.getElementById('numcol').value || 2;
    initVal = initVal || document.getElementById('initval').value || 2;
    lookahead = lookahead || document.getElementById('lookahead').value || 2;
    gameMode = gameMode || document.getElementById('gamemode').value || 0;
    stepDelay = stepDelay || document.getElementById('stepdelay').value || 1200;
    autoplay = autoplay || document.getElementById('autoplay').value || 0;
    turn = turn || PLAYER_A;

    if (numCol < 1) {
        numCol = 1;
    } else if (numCol > 10) {
        numCol = 10;
    }
    if (initVal < 1) {
        initVal = 1;
    }
    if (lookahead < 1) {
        lookahead = 1;
    }
    if (gameMode < 0 || gameMode > 3) {
        gameMode = 0;
    }
    if (stepDelay < 200) {
        stepDelay = 200;
    } else if (stepDelay > 2200) {
        stepDelay = 2200;
    }
    if (autoplay == 0) {
        autoplay = true;
    } else if (autoplay == 1) {
        autoplay = false;
    } else {
        autoplay = true;
    }

    board = createBoard(numCol, initVal, turn);
    plys = lookahead;
    mode = gameMode;
    delay = stepDelay;
    auto = autoplay;
    winner = null;
    displayBoard();
}

function createBoard(numCol, initVal, turn) {
    numCol = numCol || 2;
    initVal = initVal || 2;
    turn = turn || PLAYER_A;

    var newBoard = {
        A: [],
        B: [],
        turn: turn, 
        prev: -1
    };
    for (var i = 0; i < numCol; i++) {
        newBoard.A.push(initVal);
        newBoard.B.push(initVal);
    }

    return newBoard;
}

function hash(gameBoard) {
    var str = '';
    var aStr = 'A:';
    var bStr = 'B:';
    for (var i = 0; i < gameBoard.A.length; i++) {
        aStr += gameBoard.A[i] + '/';
        bStr += gameBoard.B[i] + '/'; 
    }
    str += aStr + '-' + bStr;
    var turnStr = 'turn:B';
    if (gameBoard.turn == PLAYER_A) {
        turnStr = 'turn:A';
    }
    str += '-' + turnStr;
    return str;
}

function displayBoard() {
    var boardContainer = document.getElementById('board');
    var boardTable = document.createElement('table');
    var aRow = document.createElement('tr');
    var bRow = document.createElement('tr');

    for (var i = 0; i < board.A.length; i++) {
        var aTd = document.createElement('td');
        var bTd = document.createElement('td');
        var button = document.createElement('button');
        aTd.className = 'a_square';
        bTd.className = 'b_square';
        button.value = i;
        button.onclick = function() {
            move(this.value);
        };
        if (checkWinner()
                || (mode == 1 && board.turn == PLAYER_B)
                || (mode == 2 && board.turn == PLAYER_A)
                || mode == 3
                || running) {
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
        if (board.turn == PLAYER_A) {
            if (board.prev == i) {
                bTd.className = 'b_prev';
            }
        } else {
            if (board.prev == i) {
                aTd.className = 'a_prev';
            }
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

function run() {
    if (!checkWinner()) {
        running = true;
        move(alphaBetaSearch());
        timeout = setTimeout(function() {
            run();
        }, delay);
        var button = document.getElementById('run_pause');
        button.onclick = pause;
        button.innerHTML = 'Pause';
    } else {
        pause();
    }
}

function pause() {
    clearTimeout(timeout);
    running = false;
    var button = document.getElementById('run_pause');
    button.onclick = run;
    button.innerHTML = 'Run';
    displayBoard();
}

function step() {
    pause();
    if (!checkWinner()) {
        move(alphaBetaSearch());
    }
}

function alphaBetaSearch(gameBoard, depth) {
    gameBoard = gameBoard || board;
    depth = depth || plys;
    var maxResult = maxValue(gameBoard, (Number.MAX_VALUE * -1), Number.MAX_VALUE, depth, [],
            gameBoard.turn);
    return maxResult.index;
}

function maxValue(gameBoard, alpha, beta, depth, prev, player) {
    gameBoard = cloneBoard(gameBoard);
    prev = cloneList(prev);
    var result = {index: 0, value: -1};
    if (depth == 0 || checkWinner(gameBoard)) {
        result.value = h1(gameBoard, player);
        return result;
    }
    var boardHash = hash(gameBoard);
    if (prev.indexOf(boardHash) > 0) {
        result.value = alpha;
        return result;
    }
    depth--;
    prev.push(boardHash);
    result.value = (Number.MAX_VALUE * -1);
    var order = actionOrder(gameBoard);
    for (var i = 0; i < order.length; i++) {
        var minResult = minValue(move(order[i], gameBoard), alpha, beta, depth, prev, player);
        if (minResult.value > result.value) {
            result.value = minResult.value;
            result.index = order[i];
        }
        if (result.value >= beta) {
            return result;
        }
        if (result.value > alpha) {
            alpha = result.value;
        }
    }
    return result;
}

function minValue(gameBoard, alpha, beta, depth, prev, player) {
    gameBoard = cloneBoard(gameBoard);
    prev = cloneList(prev);
    var result = {index: 0, value: -1};
    if (depth == 0 || checkWinner(gameBoard)) {
        result.value = h1(gameBoard, player);
        return result;
    }
    var boardHash = hash(gameBoard);
    if (prev.indexOf(boardHash) > 0) {
        result.value = beta;
        return result;
    }
    depth--;
    prev.push(boardHash);
    result.value = Number.MAX_VALUE;
    var order = actionOrder(gameBoard);
    for (var i = 0; i < order.length; i++) {
        var maxResult = maxValue(move(order[i], gameBoard), alpha, beta, depth, prev, player);
        if (maxResult.value < result.value) {
            result.value = maxResult.value;
            result.index = order[i];
        }
        if (result.value <= alpha) {
            return result;
        }
        if (result.value < beta) {
            beta = result.value;
        }
    }
    return result;
}

function actionOrder(gameBoard) {
    var order = [];
    if (gameBoard.turn == PLAYER_A) {
        for (var i = 0; i < gameBoard.A.length; i++) {
            if (gameBoard.A[i] > 0) {
                order.push(i);
            }
        }
    } else {
        for (var i = gameBoard.B.length - 1; i >= 0; i--) {
            if (gameBoard.B[i] > 0) {
                order.push(i);
            }
        }
    }
    return order;
}

function h1(gameBoard, player) {
    gameBoard = gameBoard || board;
    player = player || gameBoard.turn;
    var total = 0;
    if (player == PLAYER_A) {
        for (var i = 0; i < gameBoard.A.length; i++) {
            total += gameBoard.A[i];
        }
    } else {
        for (var i = 0; i < gameBoard.B.length; i++) {
            total += gameBoard.B[i];
        }
    }
    return total;
}

function move(index, gameBoard) {
    var player = board.turn;
    var value = 0;
    var update = true;
    if (gameBoard) {
        update = false;
        gameBoard = cloneBoard(gameBoard);
    } else {
        gameBoard = board;
        gameBoard.prev = index;
    }
    if (gameBoard.turn == PLAYER_A) {
        value = gameBoard.A[index];
        gameBoard.A[index] = 0;
        if (index < gameBoard.A.length - 1) {
            index++;
        } else {
            player = PLAYER_B;
        }
        if (update && !running && auto && mode == 1) {
            timeout = setTimeout(function() {
                if (!checkWinner()) {
                    move(alphaBetaSearch());
                }
            }, delay);
        }
        gameBoard.turn = PLAYER_B;
    } else {
        value = gameBoard.B[index];
        gameBoard.B[index] = 0;
        if (index > 0) {
            index--;
        } else {
            player = PLAYER_A;
        }
        if (update && !running && auto && mode == 2) {
            timeout = setTimeout(function() {
                if (!checkWinner()) {
                    move(alphaBetaSearch());
                }
            }, delay);
        }
        gameBoard.turn = PLAYER_A;
    }
    gameBoard = distribute(player, index, value, gameBoard);
    if (update) {
        displayBoard();
    }
    return gameBoard;
}

function distribute(player, index, value, gameBoard) {
    if (value > 0) {
        value--;
        if (player == PLAYER_A) {
            gameBoard.A[index]++;
            if (index < gameBoard.A.length - 1) {
                index++;
            } else {
                player = PLAYER_B;
            }
        } else {
            gameBoard.B[index]++;
            if (index > 0) {
                index--;
            } else {
                player = PLAYER_A;
            }
        }
        return distribute(player, index, value, gameBoard);
    }
    return gameBoard;
}

function checkWinner(gameBoard) {
    var update = true;
    if (gameBoard) {
        update = false;
    } else {
        gameBoard = board;
    }
    var aSum = 0;
    for (var i = 0; i < gameBoard.A.length; i++) {
        aSum += gameBoard.A[i];
    }
    if (aSum == 0) {
        if (update) {
            winner = PLAYER_B;
        } else {
            return true;
        }
    } else {
        var bSum = 0;
        for (var i = 0; i < board.B.length; i++) {
            bSum += board.B[i];
        }
        if (bSum == 0) {
            if (update) {
                winner = PLAYER_A;
            } else {
                return true;
            }
        }
    }
    if (update) {
        var winElement = document.getElementById('winner');
        if (winner) {
            if (winner == PLAYER_A) {
                winElement.className = 'a_winner';
                winElement.innerHTML = 'Player A Wins!';
            } else {
                winElement.className = 'b_winner';
                winElement.innerHTML = 'Player B Wins!';
            }
            return true;
        } else {
            winElement.innerHTML = '';
        }
    }
    return false;
}
