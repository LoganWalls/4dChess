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

	//Conver mobility array into movement directions.
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
						window.game.view.bindMovement(this,[curRow,curCol]);
						break;

					//If unit is ally.
					}else{
						break;
					}
				//If empty.
				}else{
					window.game.view.bindMovement(this,[curRow,curCol]);
				}
			}
		}
		window.game.view.tiles[unitRow][unitCol].onclick = function(){
			window.game.view.resetBindings();
		};
	}
}

King.prototype = new Unit();
King.prototype.constructor= King;
function King(owner, board, row, col){

	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("K");
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
	this.sprite = document.createTextNode("Q");
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
	this.sprite = document.createTextNode("B");
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
	this.sprite = document.createTextNode("Kn");
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
						window.game.view.bindMovement(this,[orthRow,orthCol]);

					//If unit is ally.
					}else{

					}
				//If empty.
				}else{
					window.game.view.bindMovement(this,[orthRow,orthCol]);
				}
			}
		}
		//Clicking on the unit again cancels to the movement.
		window.game.view.tiles[this.position[0]][this.position[1]].onclick = function(){
			window.game.view.resetBindings();
		};
	}
};

Rook.prototype = new Unit();
Rook.prototype.constructor= Rook;
function Rook(owner, board, row, col){
	this.owner = owner;
	this.board = board;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("R");
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
	this.sprite = document.createTextNode("P");
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
				window.game.view.bindMovement(this,[curRow,curCol]);
			}
		}
	}

	if(!this.firstMove){
		//Explore attack tiles.
		for(var i = 1; i <= 2; i++){
			var curRow = unitRow+1;
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
						window.game.view.bindMovement(this,[curRow,curCol]);
					}
				}
			}
		}
	}

	//Convert mobility array into movement directions.
	for(var i = 0; i < this.mobility.length; i++){
		//Maximum movement in the current direction.

		window.game.view.tiles[unitRow][unitCol].onclick = function(){
			window.game.view.resetBindings();
		};
	}
};