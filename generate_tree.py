#! /usr/bin/env python

from collections import deque
from copy import deepcopy

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
        self.str = "[" + str(a1) + "|" + str(a2) + "]\n[" + str(b1) + "|" \
                + str(b2) + "]"
        self.hash = ((turn * 10000) + (a1 * 1000) + (a2 * 100) + (b1 * 10)
                + (b2 * 1))
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
    if not move == "left" and not move == "right":
        raise Exception("invalid move attempted")
    if board.winner:
        raise Exception("game is already won")
    a1 = board.a1
    a2 = board.a2
    b1 = board.b1
    b2 = board.b2
    if board.turn == A_TURN:
        if move == "left":
            if a1 == 0:
                return None
            dist = a1
            a1 = 0
            if dist >= 4:
                a1 += 1
                a2 += 1
                b1 += 1
                b2 += 1
                dist -= 4
            if dist >= 1:
                a2 += 1
            if dist >= 2:
                b2 += 1
            if dist == 3:
                b1 += 1
        elif move == "right":
            if a2 == 0:
                return None
            dist = a2
            a2 = 0
            if dist >= 4:
                a1 += 1
                a2 += 1
                b1 += 1
                b2 += 1
                dist -= 4
            if dist >= 1:
                b2 += 1
            if dist >= 2:
                b1 += 1
            if dist == 3:
                a1 += 1
    else:
        if move == "left":
            if b1 == 0:
                return None
            dist = b1
            b1 = 0
            if dist >= 4:
                a1 += 1
                a2 += 1
                b1 += 1
                b2 += 1
                dist -= 4
            if dist >= 1:
                a1 += 1
            if dist >= 2:
                a2 += 1
            if dist == 3:
                b2 += 1
        elif move == "right":
            if b2 == 0:
                return None
            dist = b2
            b2 = 0
            if dist >= 4:
                a1 += 1
                a2 += 1
                b1 += 1
                b2 += 1
                dist -= 4
            if dist >= 1:
                b1 += 1
            if dist >= 2:
                a1 += 1
            if dist == 3:
                a2 += 1
    next_turn = 1 - board.turn
    return Board(a1, a2, b1, b2, next_turn)

def buildTree(parent, prev):
    left_board = makeMove(parent.value, "left")
    if left_board:
        if left_board.winner:
            parent.left = Node(left_board)
        else:
            if not left_board.hash in prev:
                new_prev = deepcopy(prev)
                new_prev.add(left_board.hash)
                parent.left = buildTree(Node(left_board), new_prev)
    right_board = makeMove(parent.value, "right")
    if right_board:
        if right_board.winner:
            parent.right = Node(right_board)
        else:
            if not right_board.hash in prev:
                new_prev = deepcopy(prev)
                new_prev.add(right_board.hash)
                parent.right = buildTree(Node(right_board), new_prev)
    return parent

def printTree(root):
    if not root:
        return
    print root.value.str + "\n"
    printTree(root.left)
    printTree(root.right)

def printNodeQueue(queue):
    print "----------"
    while queue:
        print queue.popleft() + "\n"
    print "----------"

def printTreeBranches(root, queue):
    queue.append(root.value.str)
    if not root.left and not root.right:
        printNodeQueue(deepcopy(queue))
    if root.left:
        printTreeBranches(root.left, deepcopy(queue))
    if root.right:
        printTreeBranches(root.right, deepcopy(queue))

def main(args):
    print "STARTED\n\n"
    start_board = Board(2, 2, 2, 2, A_TURN)
    prev = set();
    prev.add(start_board.hash)
    board_tree = buildTree(Node(start_board), prev)
    # printTree(board_tree)
    printTreeBranches(board_tree, deque())
    print "\n\nFINISHED"

if __name__ == "__main__":
    main(None)
