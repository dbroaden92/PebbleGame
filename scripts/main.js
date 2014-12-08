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
var prevBoards = [];
var addToPrev = true;

// Make a deep copy of the given game board.
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

// Make a copy of the given list.
function cloneList(list) {
    var newList = [];
    for (var i = 0; i < list.length; i++) {
        newList.push(list[i]);
    }
    return newList;
}

// Set the delay between steps while running.
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

// Set autoplay for the computer to on or off.
function setAuto(newAuto) {
    newAuto = newAuto || document.getElementById('autoplay').value || 0;
    if (newAuto == 0) {
        auto = true;
    } else {
        auto = false;
    }
}

// reset the board and set up a new game.
function newGame(numCol, initVal, lookahead, turn, gameMode, stepDelay, autoplay) {
    if (running) {
        pause();
    }

    // Get data from the user input fields.
    numCol = numCol || document.getElementById('numcol').value || 2;
    initVal = initVal || document.getElementById('initval').value || 2;
    lookahead = lookahead || document.getElementById('lookahead').value || 2;
    gameMode = gameMode || document.getElementById('gamemode').value || 0;
    stepDelay = stepDelay || document.getElementById('stepdelay').value || 1200;
    autoplay = autoplay || document.getElementById('autoplay').value || 0;
    turn = turn || PLAYER_A;

    // Input clamping.
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

    document.getElementById('numcol').value = numCol;
    document.getElementById('initval').value = initVal;
    document.getElementById('lookahead').value = lookahead;

    // Game setup.
    board = createBoard(numCol, initVal, turn);
    plys = lookahead;
    mode = gameMode;
    delay = stepDelay;
    auto = autoplay;
    winner = null;
    prevBoards = [];
    addToPrev = true;
    displayBoard();
}

// Create a new board with the specified number of columns each with the initial value.
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

// String hash of the given game board state.
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

// Update the displayed board to the current board's state.
function displayBoard() {
    var boardContainer = document.getElementById('board');
    var boardTable = document.createElement('table');
    var aRow = document.createElement('tr');
    var bRow = document.createElement('tr');

    // Iterate through each column.
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
        if (checkWinner(board)
                || (mode == 1 && board.turn == PLAYER_B)
                || (mode == 2 && board.turn == PLAYER_A)
                || mode == 3
                || running) {
            // Don't add a button.
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

        // Mark the previous move.
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
    boardTable.className = 'game';

    // Remove the previous board and anything else.
    while (boardContainer.firstChild) {
        boardContainer.removeChild(boardContainer.firstChild);
    }
    boardContainer.appendChild(boardTable);
    checkWinner();
}

// Show the settings menu.
function show() {
        var setup = document.getElementById('setup');
        setup.style.maxHeight = '210';
        var button = document.getElementById('show_hide');
        button.onclick = hide;
        button.innerHTML = 'Hide';
}

// Hide the settings menu.
function hide() {
        var setup = document.getElementById('setup');
        setup.style.maxHeight = '0';
        var button = document.getElementById('show_hide');
        button.onclick = show;
        button.innerHTML = 'Settings';
}

// Run automatically with the CPUs playing against each other.
function run() {
    if (!checkWinner()) {
        running = true;
        if (board.turn == PLAYER_A) {
            move(alphaBetaSearch());
        } else {
            move(andOrSearch());
        }
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

// Stop running automatically.
function pause() {
    clearTimeout(timeout);
    running = false;
    var button = document.getElementById('run_pause');
    button.onclick = run;
    button.innerHTML = 'Run';
    displayBoard();
}

// Step once, taking the move specified by the CPU.
function step() {
    pause();
    if (!checkWinner()) {
        if (board.turn == PLAYER_A) {
            move(alphaBetaSearch());
        } else {
            move(andOrSearch());
        }
    }
}

// Minimax algorithm search for the best move with alphabeta pruning.
function alphaBetaSearch(gameBoard, depth) {
    gameBoard = gameBoard || board;
    depth = depth || plys;
    var maxResult = maxValue(gameBoard, (Number.MAX_VALUE * -1), Number.MAX_VALUE, depth, [],
            gameBoard.turn);
    return maxResult.index;
}

// MAX-VALUE function for Minimax algorithm.
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

// MIN-VALUE function for Minimax algorithm.
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

// AND-OR algorithm search for the best move.
function andOrSearch(gameBoard, depth){
    gameBoard = gameBoard || board;
    depth = depth * 2  || plys * 2;

    var results = orSearch(gameBoard,[],depth);
    return results.index;
}

// OR-SEARCH function for AND-OR algorithm.
function orSearch(gameBoard, trail, depth){

    trail = cloneList(trail);
    gameBoard = cloneBoard(gameBoard);

    //Depth and Goal State
    if(depth == 0 || checkWinner(gameBoard)){
        return {index:null, weight: h1(gameBoard, gameBoard.turn)};
    }

    //Current state is on path
    var board_hash = hash(gameBoard);
    if(trail.indexOf(board_hash) > 0){
        return {index:null, weight:0};
    }

    depth--;
    trail.push(board_hash);

    //Each Posible Action
    var best_move = {index:0, weight:0};
    var move_index = actionOrder(gameBoard);
    for (var i = 0; i < move_index.length; i++){
        var and_results = andSearch(move(move_index[i], gameBoard),trail,depth);
//        console.log("And Results: " + and_results + "Depth: " + depth);
        if(and_results > best_move.weight){
            best_move.index = move_index[i];
            best_move.weight = and_results;
        }
    }
    if (best_move.weight == 0){
        best_move.index = move_index[0];
    }
    return best_move;
}

// AND-SEARCH function for AND-OR algorithm.
function andSearch(gameBoard, trail, depth){
    gameBoard = cloneBoard(gameBoard);

    //Depth and Goal State
    if(depth == 0 || checkWinner(gameBoard)){
        return 0;
    }

    depth--;

    //Each Posible Action, assumes opponent makes random decision
    var move_index = actionOrder(gameBoard);
    var sum = 0;
    var or_resutls;
    for (var i = 0; i < move_index.length; i++){
        or_results = orSearch(move(move_index[i], gameBoard),trail,depth);
        sum += (1/move_index.length) *  or_results.weight;
    }
    return sum;
}

// Returns the order for the algorithms to evaluate potential moves.
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

// Heuristic for evaluating a game board state.
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

// Make the specified move on a game board.
function move(index, gameBoard) {
    var value = 0;
    var update = true;
    if (gameBoard) {
        update = false;
        gameBoard = cloneBoard(gameBoard);
    } else {
        gameBoard = board;
        gameBoard.prev = index;
    }
    // The player whose squares to begin the pebble distribution.
    var player = gameBoard.turn;
    if (gameBoard.turn == PLAYER_A) {
        // Collect the pebbles and empty the square.
        value = gameBoard.A[index];
        gameBoard.A[index] = 0;
        if (index < gameBoard.A.length - 1) {
            index++;
        } else {
            player = PLAYER_B;
        }
        // The CPU will make it's next move after a delay if autoplay is on.
        if (update && !running && auto && mode == 1) {
            timeout = setTimeout(function() {
                if (!checkWinner()) {
                    move(alphaBetaSearch());
                }
            }, delay);
        }
        gameBoard.turn = PLAYER_B;
    } else {
        // Collect the pebbles and empty the square.
        value = gameBoard.B[index];
        gameBoard.B[index] = 0;
        if (index > 0) {
            index--;
        } else {
            player = PLAYER_A;
        }
        // The CPU will make it's next move after a delay if autoplay is on.
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
        // Detect if a loop has been reached. (mainly for CPU vs CPU)
        var boardHash = hash(gameBoard);
        if (addToPrev && prevBoards.indexOf(boardHash) > -1) {
            console.log('Game Loop Detected');
            console.log('# Moves: ' + (prevBoards.length + 1));
            console.log('Board Hash: ' + boardHash);
            addToPrev = false;
        }
        if (addToPrev) {
            prevBoards.push(boardHash);
        }
        displayBoard();
    }
    return gameBoard;
}

// Distribute the pebbles in a clockwise manner around the board.
// Starts at the square specified by player and index.
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

// Check if the given game board has a winner.
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
        for (var i = 0; i < gameBoard.B.length; i++) {
            bSum += gameBoard.B[i];
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
        // Display a message for the winner and a New Game button.
        var boardContainer = document.getElementById('board');
        var exists = document.getElementById('win_table');
        if (exists) {
            boardContainer.removeChild(exists);
        }
        if (winner) {
            var winTable = document.createElement('table');
            winTable.id = 'win_table';
            winTable.className = 'win_table';
            var winMsgRow = document.createElement('tr');
            var newGameRow = document.createElement('tr');
            var winMsgTd = document.createElement('td');
            var newGameTd = document.createElement('td');
            var newGameButton = document.createElement('button');
            newGameButton.innerHTML = 'New Game';
            newGameButton.onclick = function () {
                newGame();
            };
            if (winner == PLAYER_A) {
                winMsgTd.appendChild(document.createTextNode('Player A Wins!'));
                winMsgTd.className = 'a_winner';
            } else {
                winMsgTd.appendChild(document.createTextNode('Player B Wins!'));
                winMsgTd.className = 'b_winner';
            }
            winMsgRow.appendChild(winMsgTd);
            newGameTd.appendChild(newGameButton);
            newGameRow.appendChild(newGameTd);
            winTable.appendChild(winMsgRow);
            winTable.appendChild(newGameRow);
            boardContainer.appendChild(winTable);
            return true;
        }
    }
    return false;
}
