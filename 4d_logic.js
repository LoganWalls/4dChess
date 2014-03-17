window.onload = function(){
  //Initial Game Setup
  var disp = document.getElementById("game_area");
  window.game = new Game(disp);
  window.game.gameSetup(2);
  //Bindings go here.

  //Test code

};

//Game object to encapsulate the game state.
function Game(disp){
	this.disp = disp;
	this.turn = 0;
	this.boards = new Array();
	this.graveyard = new Array();
}

//Ends the game delcaring the provided 'winner'
//the victor.
Game.prototype.gameOver = function(winner){
	this.turn = 0;
	this.view.displayGameOver(winner);
	//To add Clean-up and Restart Code
};

//Advances the game turn.
Game.prototype.nextTurn = function(){
	if(this.turn == 1){
		this.turn = 2;
	}else if(this.turn == 2){
		this.turn = 1;
	}
	this.view.updateTurn();
};

Game.prototype.gameSetup = gameSetup;

//Setsup a new game with the given number of players and baords.
function gameSetup(boards){

	for(var i = 0; i < boards; i++){
		var b = new Board(i+1, window.game.view);
		b.populate();
		this.boards.push(b);
	}
	this.turn = 1;
	var d = document.getElementById("active_board");
	window.game.view = new Viewer(this.boards[0], d);
}

//A chess board, controls game logic.
function Board(boardId, Viewer){
	//The id to keep track of all game boards(1 based index);
	this.boardId = boardId;

	//The Viewer Object which handles rendering this board:
	this.view = Viewer;
	//Where all of the pieces 'live'.
	this.grid = new Array(8);

	for(var i = 0; i < this.grid.length; i++){
		this.grid[i] = new Array(8);
	}
}


Board.prototype.populate = populate;
//Sets up a grid representing a chess board with all units in
//their default positions.
function populate(){
	var whiteRow = 0; //These are row indexes, zero-based.
	var blackRow = 7;

	var wPawnRow = whiteRow + 1;
	var bPawnRow = blackRow - 1;

	for(var i = 0; i < this.grid[0].length; i++){
		//Add a pawn to each side.
		this.grid[wPawnRow][i] = new Pawn(1,this,wPawnRow,i);
		this.grid[bPawnRow][i] = new Pawn(2,this,bPawnRow,i);
		//Add the appropriate unit.
		var wUnit = null;

		switch(i){
			case 0:
			case 7:
				wUnit = new Rook(1,this,whiteRow,i);
				break;

			case 1:
			case 6:
				wUnit = new Knight(1,this,whiteRow,i);
				break;

			case 2:
			case 5:
				wUnit = new Bishop(1,this,whiteRow,i);
				break;

			case 3:
				wUnit = new Queen(1,this,whiteRow,i);
				break;

			case 4:
				wUnit = new King(1,this,whiteRow,i);
				break;

			default:
				throw("Error, invalid grid index.("+i+")");
				break;
		}

		//Get the corresponding black unit.
		var bUnit = null;

		if(i == 3){
			bUnit = new King(2,this,blackRow,i);
		}else if(i == 4){
			bUnit = new Queen(2,this,blackRow,i);
		}else{
			bUnit = new wUnit.constructor(2,this,blackRow,i);
		}

		this.grid[whiteRow][i] = wUnit;
		this.grid[blackRow][i] = bUnit;
	}
}

Board.prototype.move = move;
function move(unit, target){

	var targetRow = target[0];
	var targetCol = target[1];

	if(unit.firstMove){
		unit.firstMove = false;
	}

	//If there's another unit in the square kill it.
	var enemy = this.grid[targetRow][targetCol];
	if(enemy){
		unit.experience++;
		window.game.view.erase(enemy);
		window.game.graveyard.push(enemy);
	}

	//Clear unit's current grid location and set new location in grid and unit.
	this.grid[unit.position[0]][unit.position[1]] = null;
	this.grid[targetRow][targetCol] = unit;
	unit.position = [targetRow, targetCol];
	
	if(enemy){
		if(enemy.constructor == King){
			window.game.gameOver(unit.owner);
		}else{
			window.game.nextTurn();
		}
	}else{
			window.game.nextTurn();
		}
}