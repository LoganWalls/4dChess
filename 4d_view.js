function Viewer(){
	this.tiles = new Array();
}

Viewer.prototype.initializeBoard= function(board){
	this.tiles[board.boardId] = new Array();
	this.setupTiles(board);
	this.setupUnits(board);
};

//Sets up the tiles for the provided board.
Viewer.prototype.setupTiles= function (board){
	var tiles = this.tiles[board.boardId];

	var destHeight = board.displayDest.offsetHeight;
	var destWidth = board.displayDest.offsetWidth;
	//Color of current tile.
	var dark = false;

	for(var row = 0; row < board.grid.length; row++){
			dark = !dark;
			tiles.push(new Array());
		for(var col = 0; col < board.grid[0].length; col++){
			var h = 100/board.grid.length; //Tile Height in Percent
			var w = 100/board.grid[0].length; //Tile Width in Percent

			//Create Board Tile
			var tile = document.createElement("DIV");

			tile.style.height = h+"%";
			tile.style.width = w+"%";
			tile.style.bottom = row*h+"%";
			tile.style.left = col*w+"%";
			tile.className += " backgroundTile";

			if(dark){
				tile.className += "_Dark";
				dark = false;
			}else{
				tile.className += "_Light";
				dark = true;
			}
			tiles[row][col] = tile;
			board.displayDest.appendChild(tile);
		}
	}
};

//Creates DOM elements for all units.
Viewer.prototype.setupUnits= function (board){

	for(var row = 0; row < board.grid.length; row++){

		for(var col = 0; col < board.grid[0].length; col++){
			//Create unit (if any)
			var curUnit = board.grid[row][col];

			if(curUnit){
				this.setupUnitDisplay(curUnit);
			}
		}
	}
};

//Sets up the unit's display at the given tile.
Viewer.prototype.setupUnitDisplay = function(unit){

	//Get the board tile corresponding to the unit's position.
	var unitRow = unit.position[0];
	var unitCol = unit.position[1];
	var unitTile = this.tiles[unit.board.boardId][unitRow][unitCol];

	//Create DOM Element.
	var unitDisp = document.createElement("DIV");
	unitDisp.className = "unit";
	unitDisp.appendChild(unit.sprite);

	if(unit.owner == 1){
		unitDisp.className += " player_1";
	}else{
		unitDisp.className += " player_2";
	}
	unit.displayElement = unitDisp;
	unit.board.displayDest.appendChild(unitDisp);

	//Align Unit height and width with tile center.
	unitDisp.style.bottom = parseFloat(unitTile.style.bottom)+(parseFloat(unitTile.style.height)/2)-((unitDisp.offsetHeight/2)/(unitDisp.parentNode.offsetHeight)*100)+"%";
	unitDisp.style.left = parseFloat(unitTile.style.left)+(parseFloat(unitTile.style.width)/2)-((unitDisp.offsetWidth/2)/(unitDisp.parentNode.offsetWidth)*100)+"%";
	this.updateAura(unit);

	//Bind Movement Functions
	if(window.game.turn == unit.owner && window.game.activeBoard == unit.board.boardId){
		unitTile.onclick = unit.movementPath.bind(unit);
	}
	unitTile.className += " occupied";
}


//Coordinates is an array of two elements [x,y] the desired grid coordinates.
//Returns an array of integer pixel values [x,y].
//Converts grid coordinates to corresponding pixel values.
//Pixel values relative to the Viewer's 'destination'.
Viewer.prototype.gridToPix = function (coordinates){

	var x = coordinates[0];
	var y = coordinates[1];
	var destHeight = board.displayDest.offsetHeight;
	var destWidth = board.displayDest.offsetWidth;
	var h = parseInt(destHeight/this.grid.length); //Tile Height
	var w = parseInt(destWidth/this.grid[0].length); //Tile Width

	return [x*w,y*h];
};

//Takes a unit to be moved and a target destination (as an array [row, column]).
//Binds movement to a given target destnation.
//Unit is the unit to be moved.
//Target is a 2 element array of the row and column of the target tile for the movement.
//moveFunc is the function to handle the movement.
Viewer.prototype.bindMovement = function (unit, boardId, target, moveFunc){

	var tiles = this.tiles[boardId];

	//Unit's position stored as [row, col]
	var targetRow = target[0];
	var targetCol = target[1];

	//The DOM element for the destination tile.
	var destTile = tiles[targetRow][targetCol];
	destTile.className += " movementTile";

	destTile.onclick = function(){
		moveFunc.bind(unit)(target);
	};
};

//Resets and updates the controls on all tiles for the given board.
//(Based on the current turn and active board for the game.)
Viewer.prototype.updateBindings = function (board){
	var tiles = this.tiles[board.boardId];

	for(var row = 0; row < tiles.length; row++){
		for(var col = 0; col < tiles[0].length; col++){
			var cur = tiles[row][col];

			//Unbind click functions.
			cur.onclick = null;

			//Remove movement highlighting.
			cur.className = cur.className.replace(/(?:^|\s)movementTile(?!\S)/g,'');
			cur.className = cur.className.replace(/(?:^|\s)occupied(?!\S)/g,'');

			//Re-bind movePath function
			if(board.grid[row][col]){
				var unit = board.grid[row][col];

				if(window.game.turn == unit.owner && window.game.activeBoard == unit.board.boardId){
					cur.onclick = unit.movementPath.bind(unit);
				}
				cur.className += " occupied";
			}
		}
	}
};

Viewer.prototype.bindCancelCommand = function(unit){

	var tiles = this.tiles[unit.board.boardId];
	var reset = function(){
		this.updateBindings(unit.board);
	};
	//Clicking on the unit again cancels to the movement.
	tiles[unit.position[0]][unit.position[1]].onclick = reset.bind(this);
}

//Update the board assigned to the unit.
Viewer.prototype.updateUnitBoard = function (unit){
	unit.displayElement.parentNode.removeChild(unit.displayElement);
	unit.board.displayDest.appendChild(unit.displayElement);
};

//Erases a unit from the DOM.
Viewer.prototype.erase = function (unit){
	unit.board.displayDest.removeChild(unit.displayElement);
	unit.displayElement = null;
};

//Update the screen to reflect turn change.
Viewer.prototype.updateTurn = function(){
	var activeBoard = window.game.activeBoard;
	var turnDisplay = document.getElementById("turn_display");
	turnDisplay.innerHTML = "It's Player "+window.game.turn+"'s Turn";

	//Fade non-active boards.
	for(var i = 0; i < window.game.boards.length; i++){
		curBoard = window.game.boards[i];
		if(curBoard.boardId == activeBoard){
			curBoard.displayDest.className += " activeBoard";
		}else{
			curBoard.displayDest.className = curBoard.displayDest.className.replace(/(?:^|\s)activeBoard(?!\S)/g,'');
		}
	}
};

//Display Gameover Screen
Viewer.prototype.displayGameOver = function(winner){
	var turnDisplay = document.getElementById("turn_display");
	var p = document.createElement("p");
	p.innerHTML = "GAME OVER";
	var winnerName = document.createElement("p");
	winnerName.innerHTML = "Player "+winner+" is Victorious!";
	//Fade all boards
	for(var i = 0; i < window.game.boards.length; i++){
		curBoard = window.game.boards[i];
		curBoard.displayDest.className = curBoard.displayDest.className.replace(/(?:^|\s)activeBoard(?!\S)/g,'');
	}
	turnDisplay.innerHTML = "";
	turnDisplay.appendChild(p);
	turnDisplay.appendChild(winnerName);
};

//Make the unit glow if it can warp, remove glow otherwise.
Viewer.prototype.updateAura = function(unit){
	if(unit.experience >= 2){
		unit.displayElement.className += " canWarp";
	}else{
		unit.displayElement.className = unit.displayElement.className.replace(/(?:^|\s)canWarp(?!\S)/g,'');
	}
}

//Opens the promotion menu for the given unit at the given coordinates.
Viewer.prototype.promotionMenu = function(unit){
	var menu = document.getElementById("context_menu");
	var promoteButton = document.getElementById("promote_button");
	var boardId = unit.board.boardId;
	//Unbind all movement functions:
	for(var row = 0; row < this.tiles[boardId].length; row++){
		for(var col = 0; col < this.tiles[boardId][row].length; col++){
			this.tiles[boardId][row][col].onclick = null;
		}
	}

	//Clicking the button will promote the unit to the selected new station
	//and will advance the turn.
	promoteButton.onclick = function(){
		var promotion = document.getElementById("promotion_select").value;
		unit.promote(promotion);
		document.getElementById("context_menu").style.display = "none";
		window.game.nextTurn();
	};

	menu.style.display = "inline-block";
}
