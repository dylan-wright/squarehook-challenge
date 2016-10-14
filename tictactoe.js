/*  Dylan Wright
 *  dylan.wright@dcwright.xyz
 *  https://github.com/dylan-wright/squarehook-challenge/
 *
 *  Squarehook Challenge: Tic Tac Toe
 *      tictactoe.js
 *          Javascript implementing tictactoe game and an unbeatable
 *          AI opponent
 */

/*  TranspositionTable
 *      optimization of state space. boards that are the same but reached
 *      through seperate sequence of moves can be represented by a single
 *      object in the state tree
 */
var TranspositionTable = function () {
    /* table - hold objects of form: {stateString: ".........", 
     *                                state: State object}
     */
    var table = [];

    return {
        init: function () {
        },
        
        /*  isIn:
         *      determine if stateString is already in the table
         *
         *      I: a 9 character string representing a board
         *      O: a bool indicating if the state was found
         */
        isIn: function (stateString) {
            var i;

            for (i = 0; i < table.length; i++) {
                if (table[i].stateString == stateString) {
                    return true;
                }
            }

            return false;
        },

        /*  add:
         *      add a state to the transposition table
         *
         *      I: a State object
         *      O: state added to table. no return
         */
        add: function (state) {
            table.push({"stateString": state.toString(), "state": state});
        },

        /*  get:
         *      retrive the state represented by stateString
         *
         *      I: a 9 character string representing a board
         *      O: the State object represented by stateString
         *         if not found returns undefined
         */
        get: function (stateString) {
            var i;

            for (i = 0; i < table.length; i++) {
                if (table[i].stateString == stateString) {
                    return table[i].state;
                }
            }
        },
    }
};

/*  State
 *      object representing a node in the state space tree
 */
var State = function() {
    return {
        /*  init
         *      initialize the State object
         *
         *      I: the dimensionality of the game board to be constructed
         *      O: create empty board and children lists
         *         populate board list with " "
         *         return the State to support chained calls
         */
        init: function(dimension) {
            var i, j;
            this.board = [];
            this.children = [];
            
            for (i = 0; i < dimension; i++) {
                this.board.push([]);
                for (j = 0; j < dimension; j++) {
                    this.board[i].push(" ");
                }
            }
            return this;
        },

        /*  copySet
         *      copy a board of another State and change a space
         *
         *      I: parentBoard-board from another State object
         *         r-the row of the board to be changed
         *         c-the column of the board to be changed
         *         letter-the letter [XO] to be put into the board
         *      O: letter inserted into the new State board
         *         return the State to support chained calls
         */
        copySet: function(parentBoard, r, c, letter) {
            var i, j;
            this.board = [];
            this.children = [];

            for (i = 0; i < parentBoard.length; i++) {
                this.board.push([]);
                for (j = 0; j < parentBoard[i].length; j++) {
                    this.board[i].push(parentBoard[i][j]);
                }
            }

            this.board[r][c] = letter;
            
            return this;
        },

        /*  generateChildren
         *      recursively generate children of the State by generating a
         *      new State for each empty space
         *
         *      uses TranspositionTable to avoid generating State objects more
         *      than once
         *
         *      I: letter-the letter representing the player whose turn it is
         *      O: populate the children list of the State
         *         returns the State to support chained calls
         */
        generateChildren: function(letter) {
            var i, j, child;
            var score = 0;
            var scores = [];
            var terminal, filled

            terminal = this.isTerminal();
            filled = this.isFilled();

            if (!terminal && !filled) {
                for (i = 0; i < this.board.length; i++) {
                    for (j = 0; j < this.board[i].length; j++) {
                        if (this.board[i][j] == " ") {
                            child = State().copySet(this.board, i, j, letter);

                            if (State.transposTable.isIn(child.toString())) {
                                child = State.transposTable.get(child.toString());
                            } else {
                                child.generateChildren(letter == "X" ? "O" : "X");
                                State.transposTable.add(child);
                            }

                            scores.push(child.score);
                            this.children.push(child);
                        }
                    }
                }
            } else if (terminal) { /* leaf scores */
                if (letter == "X") {
                    this.score = -1;
                } else {
                    this.score = 1;
                }
            } else { /* filled aka tie */
                this.score = 0;
            }
            
            return this;
        },

        /*  isTerminal
         *      determine if the State is terminal (win/lose)
         *
         *      I:
         *      O: true if board is terminal otherwise false
         */
        isTerminal: function () {
            var i, j, k;
            var indexLists = []
            dimensions = this.board.length;

            if (this.isTerminal.indexLists == undefined) {
                //build -in a row- lists and compare
                //index lists based on dimensions
                //horizontal
                for (i = 0; i < dimensions; i++) {
                    indexLists.push([]);
                    for (j = 0; j < dimensions; j++) {
                        indexLists[i].push({"row": i, "col": j});
                    }
                }

                for (i = 0; i < dimensions; i++) {
                    indexLists.push([]);
                    for (j = 0; j < dimensions; j++) {
                        indexLists[indexLists.length-1].push({"row": j, "col": i});
                    }
                }

                indexLists.push([]);
                indexLists.push([]);
                for (i = 0; i < dimensions; i++) {
                    indexLists[indexLists.length - 1].push({"row": i, "col": i});
                    indexLists[indexLists.length - 2].push({"row": i, "col": dimensions-1-i});
                }
            } else {
                indexLists = this.isTerminal.indexLists;
            }

            //check
            var c, match;
            for (k = 0; k < indexLists.length; k++) {
                c = this.board[indexLists[k][0].row][indexLists[k][0].col];
                match = true;

                if (c != " ") {
                    for (i = 1; i < indexLists[k].length; i++) {
                        if (this.board[indexLists[k][i].row][indexLists[k][i].col] != c) {
                            match = false;
                            break;
                        }
                    }

                    if (match) {
                        return true;
                    }
                }

            }

            return false;
        },

        /*  isFilled
         *      determine if the board is full
         *
         *      I:
         *      O: return true if board is full otherwise return false
         */
        isFilled: function () {
            var i, j;

            for (i = 0; i < this.board.length; i++) {
                for (j = 0; j < this.board[i].length; j++) {
                    if (this.board[i][j] == " ") {
                        return false;
                    }
                }
            }

            return true;
        },

        /*  toString
         *      generate string representation of the board
         *
         *      I:
         *      O: return the characters in the board list as a string
         */
        toString: function() {
            var i, j;
            var s = ""
            
            for (i = 0; i < this.board.length; i++) {
                for (j = 0; j < this.board[i].length; j++) {
                    s += this.board[i][j];
                }
            }

            return s;
        },

        /*  getOptimalMove aka minimax
         *      perform the minimax algorithm on the State tree rooted at
         *      this node
         *
         *      I: letter-the letter representing whether the searcher is the
         *         minimizing or maximizing player
         *      O: return the best score in the tree
         */
        getOptimalMove: function (letter) {
            var i, bestScore;

            if (this.score != undefined) { /* leaf node */
                return this.score;
            } else if (letter == "X") {
                bestScore = -2;

                for (i = 0; i < this.children.length; i++) {
                    bestScore = Math.max(bestScore, 
                                         this.children[i].getOptimalMove("O"));
                }
            } else { /*letter == "O" */
                bestScore = 2;

                for (i = 0; i < this.children.length; i++) {
                    bestScore = Math.min(bestScore,
                                         this.children[i].getOptimalMove("X"));
                }
            }

            return bestScore;
        },

        board: this.board,
    }
};
//add static TranspositionTable
State.transposTable = TranspositionTable();

var Player = Backbone.Model.extend({
});

var HumanPlayer = Player.extend({
    defaults: {
        letter: "X"
    }
});

var ComputerPlayer = Player.extend({
    defaults: {
        letter: "O"
    }
});

var Game = Backbone.Model.extend({
    defaults: {
        dimensions: 3,
        board: [],
        turn: " "
    },
    
    initialize: function () {
        //create players
        this.set({human: new HumanPlayer()});
        this.set({computer: new ComputerPlayer()});
        this.set({stateTree: State().init(this.get("dimensions"))});
        this.set({stateTreeRoot: this.get("stateTree")});
        this.get("stateTree").generateChildren("X");
        this.start();
    },

    /*  start
     *      initializes game board
     *      with X/O start choice
     */
    start: function() {
        //create board using current dimensions
        //2d array of spaces
        board = this.get("board");
        dimensions = this.get("dimensions");

        for (i = 0; i < dimensions; i++) {
            board.push([]);
            for (j = 0; j < dimensions; j++) {
                board[i].push({"text": " ", "id": i*dimensions + j});
            }
        }
        
        board[0][0].text = "X";
        board[0][1].text = "O";
    },

    /*  getSpaceFromId
     *      returns the space with specified id
     */
    getSpaceFromId: function(id) {
        return this.get("board")[Math.trunc(id / this.get("dimensions"))][id % this.get("dimensions")];
    },

    /*  onClick
     *      handles click events
     */
    onClick: function(event) {
        var i;
        var space = this.getSpaceFromId(Number(event.target.id));
        stateTree = this.get("stateTree");
        board = this.get("board");

        //if tree is terminal or filled then reset the game
        if (stateTree.isTerminal() || stateTree.isFilled()) {
            this.set({"stateTree": this.get("stateTreeRoot")});
            this.set({"turn": " "});

            for (i = 0; i < board.length; i++) {
                for (j = 0; j < board[i].length; j++) {
                    board[i][j].text = " ";
                }
            }

            board[0][0].text = "X";
            board[0][1].text = "O";
        } 
        //if player letter hasnt been chosen accept clicks until it has been
        //  if the player selects O let the computer play
        else if (this.get("turn") == " ") {
            if (space.text != " ") {
                this.set({"turn": "X"});
                this.get("human").set({"letter": space.text});
                this.get("computer").set({"letter": space.text == "X" ? "O" : "X"});

                board[0][0].text = " ";
                board[0][1].text = " ";

                if (this.get("human").get("letter") == "O") {
                    this.computerPlay();
                }
            }
        } 
        //if it is the players turn and she has selected a blank space
        //  mark it
        //  if the game isnt over let the computer play
        else if (space.text == " " && this.get("turn") == this.get("human").get("letter")) {
            space.text = this.get("turn");

            this.switchTurn();

            //update stateTree to use new root (should be in children)
            for (i = 0; i < stateTree.children.length; i++) {
                if (this.boardToString() == stateTree.children[i].toString()) {
                    stateTree = stateTree.children[i];
                    break;
                }
            }

            this.set({"stateTree": stateTree});

            if (!stateTree.isTerminal() && !stateTree.isFilled()) {
                this.computerPlay();
            }
        }
    },
    
    /*  computerPlay
     *      let the computer select a move using the State.getOptimalMove
     *      method
     *      prefer moves that lead to a win, then a tie
     */
    computerPlay: function () { 
        //TODO: add pause?
        var score;
        stateTree = this.get("stateTree");
        var candidateStateTree;
        var stateFound = false;

        for (i = 0; i < stateTree.children.length; i++) {
            score = stateTree.children[i].getOptimalMove(this.get("turn") == "O" ? "X" : "O");
            
            if ((score == 1 || score == 0) && this.get("turn") == "X") {
                if (score == 0 && candidateStateTree == undefined) {
                    candidateStateTree = stateTree.children[i];
                } else {
                    stateTree = stateTree.children[i];
                    stateFound = true;
                    break;
                }
            } else if ((score == -1 || score == 0) && this.get("turn") == "O") {
                if (score == 0 && candidateStateTree == undefined) {
                    candidateStateTree = stateTree.children[i];
                } else {
                    stateTree = stateTree.children[i];
                    stateFound = true;
                    break;
                }
            }
        }

        if (!stateFound) {
            stateTree = candidateStateTree;
        }

        this.set({"stateTree": stateTree});

        for (i = 0; i < stateTree.board.length; i++) {
            for (j = 0; j < stateTree.board[i].length; j++) {
                if (stateTree.board[i][j] != this.get("board")[i][j].text) {
                    this.get("board")[i][j].text = this.get("computer").get("letter");
                }
            }
        }

        this.switchTurn();
    },

    /*  switchTurn
     *      switch the turn letter
     */
    switchTurn: function () {
        if (this.get("turn") == "X") {
            this.set({turn: "O"});
        } else {
            this.set({turn: "X"});
        }
    },

    /*  boardToString
     *      return a string representation of the board
     */
    boardToString: function () {
        var i, j;
        var s = "";
        board = this.get("board");
        
        for (i = 0; i < board.length; i++) {
            for (j = 0; j < board[i].length; j++) {
                s += board[i][j].text;
            }
        }

        return s;
    }
});

var BoardView = Backbone.View.extend({
    el: "#game_board",
    template: $("#game_board_template").html(),
    model: new Game(),

    events: {
        "click .ttt_td": "onClick"
    },

    initailize: function() {
        this.render();
    },

    render: function() {
        var html = Mustache.to_html(this.template, this.model.toJSON());
        this.$el.html(html);
    },

    /*  getScoreIfOver
     *      if the game is over return the score
     *      -1: O won
     *       1: X won
     *      undefined: game not over
     */
    getScoreIfOver: function () {
        stateTree = this.model.get("stateTree");

        if (stateTree.isTerminal()) {
            return stateTree.score;
        } else if (stateTree.isFilled()) {
            return 0;
        }
    },

    /*  getStatus
     *      return a string representing the current game status
     *      used by AppView to modify MessageView to tell player
     *      what to do or who won
     */
    getStatus: function () {
        var score = this.getScoreIfOver();

        if (score == undefined) {
            if (this.model.get("turn") == " ") {
                return "Choose a letter to play as";
            } else {
                return "";
            }
        } else {
            if (score == -1) {
                return "O player won. Click to play again";
            } else if (score == 0) {
                return "Tie. Click to play again";
            } else {
                return "X player won. Click to play again";
            }
        }
    },
    
    /*  onClick
     *      handle click events
     */
    onClick: function(event) {
        //delegate to game model
        this.model.onClick(event);
        this.render();
    }
});

var MessageView =  Backbone.View.extend({
    el: "#message",
    message: "",

    initialize: function () {
        this.render();
    },

    render: function () {
        var html = this.message;
        this.$el.html(html);
    },

    updateMessage: function (gameStatus) {
        this.message = gameStatus;
    }
});

var AppView = Backbone.View.extend({
    el: "#container",
    board: new BoardView(),
    message: new MessageView(),

    initialize: function() {
        this.listenTo(this.board.model, "change", this.render);
        this.render();
    },

    render: function() {
        this.message.updateMessage(this.board.getStatus());

        this.board.render();
        this.message.render();
    }
});

var appView = new AppView();
