A_TURN = 0
B_TURN = 1
LEFT = 0
RIGHT = 1
A_WIN = 0
B_WIN = 1

class Board:
    def __init__(self, a1, a2, b1, b2, turn):
        self.a1 = a1
        self.a2 = a2
        self.b1 = b1
        self.b2 = b2
        self.turn = turn
        self.str = "[" + a1 + "|" + a2 + "] / [" + b1 + "|" + b2 + "]"
        self.hash = (turn * 10000) + (a1 * 1000) + (a2 * 100) + (b1 * 10)
                + (b2 * 1)
        if a1 + a2 == 0:
            self.winner = B_WIN
        elif b1 + b2 == 0:
            self.winner = A_WIN
        else:
            self.winner = None

class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def makeMove(board, move):
    if not move == "left" or not move == "right":
        raise Exception("invalid move attempted")
    new_board = board
    if board.turn == A_TURN:
        if move == "left":

        elif move == "right":

    else:
        if move == "left":

        elif move == "right":


def buildTree(parent, prev):
    next_turn = 1 - parent.turn

start_board = Board(2, 2, 2, 2, A_TURN)
prev = set();
prev.add(start_board.hash)
board_tree = buildTree(start_board, prev)
