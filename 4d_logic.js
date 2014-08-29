window.onload = function(){
  //Initial Game Setup
  var disp = document.getElementById("game_area");
  window.game = new Game(disp);
  window.game.gameSetup();
};

//Game object to encapsulate the game state.
function Game(disp){
	this.disp = disp;
	this.turn = null;

	//Controls which board a move can be made on.
	this.activeBoard = null;

	//Holds the game boards.
	this.boards = new Array();

	//Holds dead units.
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

	if(this.activeBoard == 0){
		this.activeBoard = 1;
		this.otherBoard = 0;

	}else if(this.activeBoard == 1){
		if(this.turn == 1){
			this.turn = 2;
		}else if(this.turn == 2){
			this.turn = 1;
		}
		this.activeBoard = 0;
		this.otherBoard = 1;

	}else{
		throw("Error, invalid active board: "+this.activeBoard);
	}

	//Update bindings on all boards
	for(var i = 0; i < this.boards.length; i++){
			this.view.updateBindings(this.boards[i]);
		}
	window.setTimeout(function(){
		window.game.view.updateTurn();
		if(window.game.turn == 2){
			window.game.ai.decideNew();
		}
	}, 800);
};

//Sets up a new game.
Game.prototype.gameSetup = function (){

	this.turn = 1;
	this.activeBoard = 0;
	this.view = new Viewer();
	this.ai = new AI(2, 1);
	//

	for(var i = 0; i < 2; i++){
		var disp = document.getElementById("board_"+(i));
		var b = new Board(disp, i);
		b.populate();
		this.boards[i] = b;
		this.view.initializeBoard(b);
	}
	document.getElementById("start_button").onclick = function(){
		document.getElementById("intro_box").style.display = "none";
		window.game.view.updateTurn();
	}
};

//A chess board, controls game logic.
function Board(destination, id){
	//The id to keep track of all game boards(1 based index);
	this.boardId = id;

	//The Viewer Object which handles rendering this board:
	this.displayDest = destination;
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

		if(i == 4){
			bUnit = new King(2,this,blackRow,i);
		}else if(i == 3){
			bUnit = new Queen(2,this,blackRow,i);
		}else{
			bUnit = new wUnit.constructor(2,this,blackRow,i);
		}

		this.grid[whiteRow][i] = wUnit;
		this.grid[blackRow][i] = bUnit;
	}
}

Board.prototype.moveUnit = moveUnit;
function moveUnit(unit, target){

	var targetRow = target[0];
	var targetCol = target[1];

	if(unit.firstMove){
		unit.firstMove = false;
	}

	//If there's another unit in the square kill it.
	var enemy = this.grid[targetRow][targetCol];
	if(enemy){
		unit.experience++;
		window.game.view.updateAura(unit);
		window.game.view.erase(enemy);
		window.game.graveyard.push(enemy);
	}

	//Clear unit's current grid location and set new location in grid and unit.
	this.grid[unit.position[0]][unit.position[1]] = '';
	this.grid[targetRow][targetCol] = unit;
	unit.position = [targetRow, targetCol];

	//End the game if killed unit was a King.
	if(enemy && enemy.constructor == King){
		window.game.gameOver(unit.owner);

	//Handle promotion if needed.
	}else if(unit.constructor == Pawn){
		if((unit.owner == 1 && targetRow == 7)||(unit.owner == 2 && targetRow == 0)){
			console.log('ding')
			game.view.promotionMenu(unit);

		}else{
			window.game.nextTurn();
		}
		
	//Otherwise just advance the turn.	
	}else{
			window.game.nextTurn();
		}
}