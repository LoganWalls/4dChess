//Super-class for all units.
function Unit(owner, board, row, col){

	//Which player controls the unit.
	this.owner = owner;

	//The board the unit is on.
	this.board = board;

	//The position of the unit within the board.
	this.position = [row, col];

	//Experience points.
	this.experience = 0;

	//The display sprite for this unit.
	this.sprite = document.createTextNode("I AM DEATH");
	//Number of spaces the unit can move in a single turn.
	this.speed = 0;

	//Mobility is a boolean array of which directions the unit may move.
	//Eight directions in clockwise order:
	//[Up, Up-Right, Right, Down-Right, Down, etc.]
	this.mobility = [0,0,0,0,0,0,0,0];
}

Unit.prototype.getDirection = getDirection;

function getDirection(index){
	var direction = this.mobility[index];
	var directionRow = 0;
	var directionCol = 0;
	//Origin for coordinates is bottom left of board.
	switch(index){
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
			throw("Error: Invalid Unit Mobility Index: "+index);
			break;
	}

	//Reverse up and down if player 2 owns the unit.
	if(this.owner == 1){
		return [directionRow,directionCol];
	}else if(this.owner == 2){
		return [-directionRow,directionCol];
	}else{
		throw("Error, invalid unit owner: "+this.owner);
	}
}

Unit.prototype.movementPath = movementPath;

//Takes a unit, colors the posibile movement tiles for that unit
//and binds the appropriate movement functions to each tile.
function movementPath(){

	//Dimensions of the board grid.
	var gridW = this.board.grid.length;
	var gridH = this.board.grid[0].length;

	//Unit's current position on grid.
	//Unit's position stored as [row, col]
	var unitRow = this.position[0];
	var unitCol = this.position[1];

	//Convert mobility array into movement directions.
	for(var i = 0; i < this.mobility.length; i++){
		//Maximum movement in the current direction.
		var direction = this.getDirection(i);
		var directionRow = direction[0];
		var directionCol = direction[1];

		//Explore tiles starting from the unit's position.
		for(var step = 1; step <= this.speed; step++){
			var curRow = (step*directionRow)+unitRow;
			var curCol = (step*directionCol)+unitCol;

			//If the tile is on the board.
			if(curCol < gridW && curRow < gridH && curCol >= 0 && curRow >= 0){
				var curTile = this.board.grid[curRow][curCol];
				//If there is a unit on the tile.
				if(curTile){
					//If the unit is an enemy
					if(curTile.owner != this.owner){
						window.game.view.bindMovement(this,this.board.boardId,[curRow,curCol],this.move);
						break;

					//If unit is ally.
					}else{
						break;
					}
				//If empty.
				}else{
					window.game.view.bindMovement(this,this.board.boardId,[curRow,curCol],this.move);
				}
			}
		}
	}
	//Binds command to jump between boards if the unit is able.
	this.warpPath();
	//Binds the command to cancel movement to the unit's current tile.
	game.view.bindCancelCommand(this);
}

Unit.prototype.warpPath = function(){
	var destBoardId = null;
	if(this.experience >= 2){
		if(this.board.boardId == 1){
			destBoardId = 2;
		}else if(this.board.boardId == 2){
			destBoardId = 1;
		}else{
			throw("Error, Invalid destination board ID: "+destBoardId);
		}
		window.game.view.bindMovement(this, destBoardId, this.position, this.warp);
	}
};

//Target is the target tile to move to.
Unit.prototype.move = function(target){

	var tiles = window.game.view.tiles[this.board.boardId];
	var destTile = tiles[target[0]][target[1]];

	//Align Unit height and width with tile center.
	unitDisp = this.displayElement;
	this.board.moveUnit(this,target);
	unitDisp.style.bottom = parseFloat(destTile.style.bottom)+(parseFloat(destTile.style.height)/2)-((unitDisp.offsetHeight/2)/(unitDisp.parentNode.offsetHeight)*100)+"%";
	unitDisp.style.left = parseFloat(destTile.style.left)+(parseFloat(destTile.style.width)/2)-((unitDisp.offsetWidth/2)/(unitDisp.parentNode.offsetWidth)*100)+"%";
};

Unit.prototype.warp = function(target){

	var destBoardId = null;
	if(this.experience >= 2){
		if(this.board.boardId == 1){
			destBoardId = 2;
		}else if(this.board.boardId == 2){
			destBoardId = 1;
		}else{
			throw("Error, Invalid destination board: "+destBoardId);
		}
		this.board.grid[this.position[0]][this.position[1]] = '';
		console.log("New Board = "+destBoardId);
		this.board = window.game.boards[destBoardId-1];
		window.game.view.updateUnitBoard(this);
		var tiles = window.game.view.tiles[destBoardId];
		var destTile = tiles[this.position[0]][this.position[1]];

    unitDisp = this.displayElement;
	  unitDisp.style.bottom = parseFloat(destTile.style.bottom)+(parseFloat(destTile.style.height)/2)-((unitDisp.offsetHeight/2)/(unitDisp.parentNode.offsetHeight)*100)+"%";
	  unitDisp.style.left = parseFloat(destTile.style.left)+(parseFloat(destTile.style.width)/2)-((unitDisp.offsetWidth/2)/(unitDisp.parentNode.offsetWidth)*100)+"%";

		this.board.moveUnit(this, this.position);
		this.experience -= 2;
		window.game.view.updateAura(this);
	}
};

//Promotes this unit to the unit defined in the string 'promotion'.
Unit.prototype.promote = function(promotion){
	
	//Acceptable unit names for safety (since we're calling a function based on the value).
	var unitNames = ["","King","Queen","Bishop","Knight","Rook"];
	if(unitNames.indexOf(promotion)){

		//Create new unit and transfer attributes.
		var row = this.position[0];
		var col = this.position[1];

		var promoted = new window[promotion](this.owner,this.board,row,col);
		promoted.experience = this.experience;


		//Overwrite this unit on the board.
		this.board.grid[row][col] = promoted;

		//Update Visuals.
		window.game.view.erase(this);
		window.game.view.setupUnitDisplay(promoted);

	}else{
		console.log("Error: invalid promotion name: "+promotion);
	}
}

King.prototype = new Unit();
King.prototype.constructor= King;
function King(owner, board, row, col){

	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("\u265A");
	this.speed = 1;
	this.mobility = [1,1,1,1,1,1,1,1];
}

Queen.prototype = new Unit();
Queen.prototype.constructor= Queen;
function Queen(owner, board, row, col){
	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("\u265B");
	this.speed = 8;
	this.mobility = [1,1,1,1,1,1,1,1];
}

Bishop.prototype = new Unit();
Bishop.prototype.constructor= Bishop;
function Bishop(owner, board, row, col){
	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("\u265D");
	this.speed = 8;
	this.mobility = [0,1,0,1,0,1,0,1];
}

Knight.prototype = new Unit();
Knight.prototype.constructor= Knight;
function Knight(owner, board, row, col){
	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("\u265E");
	this.speed = 2;
	this.mobility = [1,0,1,0,1,0,1,0];
}

Knight.prototype.movementPath = function(){

	//Dimensions of the board grid.
	var gridW = this.board.grid.length;
	var gridH = this.board.grid[0].length;

	//Convert mobility array into movement directions.
	for(var i = 0; i < this.mobility.length; i+=2){
		//Maximum movement in the current direction.
		var direction = this.getDirection(i);
		var directionRow = direction[0];
		var directionCol = direction[1];

		//Start from the unit's position.
		var curRow = this.position[0];
		var curCol = this.position[1];

		//Explore two steps in the first direction.
		for(var step = 1; step <= 2; step++){
			curRow += directionRow;
			curCol += directionCol;
		}

		//The index of the direction orthogonal to the first direction.
		var orthIndex = ((i+2)%7);
		if(orthIndex % 2 !=0){
			orthIndex -= 1;
		}

		direction = this.getDirection(orthIndex);
		directionRow = direction[0];
		directionCol = direction[1];

		//Explore one step in each orthogonal direction.
		for(var orthStep = 1; orthStep <= 2; orthStep++){
			var orthRow = curRow;
			var orthCol = curCol;
			//Look at the positive direction the first time
			//The negative direction the second time.
			if(orthStep == 1){
				orthRow += directionRow;
				orthCol += directionCol;
			}else{
				orthRow -= directionRow;
				orthCol -= directionCol;
			}

			//If the tile is on the board.
			if(orthCol < gridW && orthRow < gridH && orthCol >= 0 && orthRow >= 0){
				var orthTile = this.board.grid[orthRow][orthCol];
				//If there is a unit on the tile.
				if(orthTile){
					//If the unit is an enemy
					if(orthTile.owner != this.owner){
						window.game.view.bindMovement(this,this.board.boardId,[orthRow,orthCol],this.move);

					//If unit is ally.
					}else{

					}
				//If empty.
				}else{
					window.game.view.bindMovement(this,this.board.boardId,[orthRow,orthCol],this.move);
				}
			}
		}
	}
	this.warpPath();
	game.view.bindCancelCommand(this);
};

Rook.prototype = new Unit();
Rook.prototype.constructor= Rook;
function Rook(owner, board, row, col){
	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("\u265C");
	this.speed = 8;
	this.mobility = [1,0,1,0,1,0,1,0];
}

Pawn.prototype = new Unit();
Pawn.prototype.constructor= Pawn;
function Pawn(owner, board, row, col){
	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("\u265F");
	this.speed = 1;
	this.mobility = [1,0,0,0,0,0,0,0];
	this.firstMove = true;
	//If firstMove, speed = 2. If enemy is diagonal, pawn can attack.
}

Pawn.prototype.movementPath = function(){
	//Dimensions of the board grid.
	var gridW = this.board.grid.length;
	var gridH = this.board.grid[0].length;

	//Unit's current position on grid.
	//Unit's position stored as [row, col]
	var unitRow = this.position[0];
	var unitCol = this.position[1];

	//Get the direction to look.
	var direction = this.getDirection(0);
	var directionRow = direction[0];
	var directionCol = direction[1];
	var speed = 1;

	if(this.firstMove){
		speed = 2;
	}
	//Explore tiles for movement.
	for(var step = 1; step <= speed; step++){
		var curRow = (step*directionRow)+unitRow;
		var curCol = (step*directionCol)+unitCol;

		//If the tile is on the board.
		if(curCol < gridW && curRow < gridH && curCol >= 0 && curRow >= 0){
			var curTile = this.board.grid[curRow][curCol];
			//If there is a unit on the tile.
			if(curTile){
				break;
			//If empty.
			}else{
				window.game.view.bindMovement(this,this.board.boardId,[curRow,curCol],this.move);
			}
		}
	}

	//Handles white vs. black direction change.
	var attackDir = 1;
	if(this.owner == 2){
		attackDir *= -1;
	}
	//Explore attack tiles.
	for(var i = 1; i <= 2; i++){
		var curRow = unitRow+attackDir;
		var curCol = unitCol;

		if(i == 1){
			curCol += 1;
		}else{
			curCol -= 1;
		}

		//If the tile is on the board.
		if(curCol < gridW && curRow < gridH && curCol >= 0 && curRow >= 0){
			var curTile = this.board.grid[curRow][curCol];
			//If there is a unit on the tile.
			if(curTile){
				//If the unit is an enemy
				if(curTile.owner != this.owner){
					window.game.view.bindMovement(this,this.board.boardId,[curRow,curCol],this.move);
				}
			}
		}
	}
	this.warpPath();
	game.view.bindCancelCommand(this);
};
