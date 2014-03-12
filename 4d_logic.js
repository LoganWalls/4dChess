window.onload = function(){
  //Initial Game Setup
  var disp = document.getElementById("game_area");
  window.game = new Game(disp);
  window.game.gameSetup(2,2);
  //Bindings go here.

  //Test code

};

//Game object to encapsulate the game state.
function Game(disp){
	this.disp = disp;
	this.turn = 0;
	this.boards = new Array();
	this.players = 0;
	this.graveyard = new Array();
}

Game.prototype.gameSetup = gameSetup;

//Setsup a new game with the given number of players and baords.
function gameSetup(players, boards){

	this.players = players;

	for(var i = 0; i < boards; i++){
		var b = new Board(i+1, window.game.view);
		b.populate();
		this.boards.push(b);
	}
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

Board.prototype.movementPath = movementPath;

//Takes a unit, colors the posibile movement tiles for that unit
//and binds the appropriate movement functions to each tile.
function movementPath(unit){
	//Dimensions of the board grid.
	var gridW = this.grid.length;
	var gridH = this.grid[0].length;

	//Unit's current position on grid.
	//Unit's position stored as [row, col]
	var unitRow = unit.position[0];
	var unitCol = unit.position[1];

	//Conver mobility array into movement directions.
	for(var i = 0; i < unit.mobility.length; i++){
		//Maximum movement in the current direction.
		var direction = unit.mobility[i];
		var directionRow = 0;
		var directionCol = 0;
		//Origin for coordinates is bottom left of board.
		switch(i){
			case 0: //Up
				directionRow = direction;
				directionCol = 0;
				break;
			case 1: //Up-Right
				directionRow = direction;
				directionCol = direction;
				break;
			case 2: //Right
				directionRow = 0;
				directionCol = direction;
				break;
			case 3: //Down-Right
				directionRow = -direction;
				directionCol = direction;
				break;
			case 4: //Down
				directionRow = -direction;
				directionCol = 0;
				break;
			case 5: //Down-Left
				directionRow = -direction;
				directionCol = -direction;
				break;
			case 6: //Left
				directionRow = 0;
				directionCol = -direction;
				break;
			case 7: //Up-Left
				directionRow = direction;
				directionCol = -direction;
				break;
			default:
				throw("Error: Invalid Unit Mobility Index");
				break;
		}
		//Explore tiles starting from the unit's position.
		for(var step = 1; step <= unit.speed; step++){
			var curRow = (step*directionRow)+unitRow;
			var curCol = (step*directionCol)+unitCol;

			//If the tile is on the board.
			if(curCol < gridW && curRow < gridH && curCol >= 0 && curRow >= 0){
				var curTile = this.grid[curRow][curCol];
				//If there is a unit on the tile.
				if(curTile){
					//If the unit is an enemy
					if(curTile.owner != unit.owner){
						window.game.view.bindMovement(unit,[curRow,curCol]);
						break;

					//If unit is ally.
					}else if(unit.ignoreFriendly){
						//Keep going
					}else{
						break;
					}
				//If empty.
				}else{
					window.game.view.bindMovement(unit,[curRow,curCol]);
				}
			}
		}
		window.game.view.tiles[unitRow][unitCol].onclick = function(){
			window.game.view.resetBindings();
		};
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
		this.grid[wPawnRow][i] = new Pawn(1,wPawnRow,i);
		this.grid[bPawnRow][i] = new Pawn(2,bPawnRow,i);
		//Add the appropriate unit.
		var wUnit = null;

		switch(i){
			case 0:
			case 7:
				wUnit = new Rook(1,whiteRow,i);
				break;

			case 1:
			case 6:
				wUnit = new Knight(1,whiteRow,i);
				break;

			case 2:
			case 5:
				wUnit = new Bishop(1,whiteRow,i);
				break;

			case 3:
				wUnit = new Queen(1,whiteRow,i);
				break;

			case 4:
				wUnit = new King(1,whiteRow,i);
				break;

			default:
				throw("Error, invalid grid index.("+i+")");
				break;
		}

		//Get the corresponding black unit.
		var bUnit = null;

		if(i == 3){
			bUnit = new King(2,blackRow,i);
		}else if(i == 4){
			bUnit = new Queen(2,blackRow,i);
		}else{
			bUnit = new wUnit.constructor(2,blackRow,i);
		}

		this.grid[whiteRow][i] = wUnit;
		this.grid[blackRow][i] = bUnit;
	}
}

Board.prototype.move = move;
function move(unit, target){

	var targetRow = target[0];
	var targetCol = target[1];

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
}