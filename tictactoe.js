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
        dimensions: 4,
        board: []
    },
    
    initialize: function () {
        //create players
        this.set({human: new HumanPlayer()});
        this.set({computer: new ComputerPlayer()});

        //create board using current dimensions
        //2d array of spaces
        for (i = 0; i < this.get("dimensions"); i++) {
            this.get("board").push([]);
            for (j = 0; j < this.get("dimensions"); j++) {
                this.get("board")[i].push({"text": "", "id": i*this.get("dimensions") + j});
            }
        }
    },

    onClick: function(event) {
        console.log("You clicked on id: "+event.target.id+" text: "+event.target.innerHTML);
    },
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
    
    onClick: function(event) {
        //delegate to game model
        this.model.onClick(event);
    }
});

var AppView = Backbone.View.extend({
    el: "#container",
    board: new BoardView(),

    initialize: function() {
        this.render();
    },


    render: function() {
        this.board.render();
    }
});

var appView = new AppView();
