function Viewer(board, destination){
	this.tiles = new Array();
	this.board = board;
	this.destination = destination;

	this.setupView();
	this.createUnits();
}

Viewer.prototype.setupView= setupView;

//Sets up a new board at given destination.
function setupView(){

	this.updateTurn();

	var destHeight = this.destination.offsetHeight;
	var destWidth = this.destination.offsetWidth;
	//Color of current tile.
	var dark = false;

	for(var row = 0; row < this.board.grid.length; row++){
			dark = !dark;
			this.tiles.push(new Array());
		for(var col = 0; col < this.board.grid[0].length; col++){
			var h = 100/this.board.grid.length; //Tile Height in Percent
			var w = 100/this.board.grid[0].length; //Tile Width in Percent
			
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
			this.tiles[row][col] = tile;
			this.destination.appendChild(tile);
		}
	}
}

Viewer.prototype.createUnits= createUnits;
//Creates DOM elements for all units.
function createUnits(){

	for(var row = 0; row < this.tiles.length; row++){

		for(var col = 0; col < this.tiles[0].length; col++){
			//Create unit (if any)
			var curUnit = this.board.grid[row][col];
			var curTile = this.tiles[row][col];

			if(curUnit){
				var unitDisp = document.createElement("DIV");
				unitDisp.className = "unit";
				unitDisp.appendChild(curUnit.sprite);

				if(curUnit.owner == 1){
					unitDisp.className += " player_1";
				}else{
					unitDisp.className += " player_2";
				}
				//Align Unit height and width with tile center.
				unitDisp.style.bottom = parseFloat(curTile.style.bottom)+(100/this.tiles.length/2.5)+"%";
				unitDisp.style.left = parseFloat(curTile.style.left)+(100/this.tiles[0].length/2.5)+"%";
				curUnit.displayElement = unitDisp;
				this.destination.appendChild(unitDisp);

				//Bind Movement Functions
				if(window.game.turn == curUnit.owner){
					curTile.onclick = curUnit.movementPath.bind(curUnit);
				}
				curTile.className += " occupied";
			}
		}
	}	
}

Viewer.prototype.gridToPix = gridToPix;

//Coordinates is an array of two elements [x,y] the desired grid coordinates.
//Returns an array of integer pixel values [x,y].
//Converts grid coordinates to corresponding pixel values.
//Pixel values relative to the Viewer's 'destination'.
function gridToPix(coordinates){

	var x = coordinates[0];
	var y = coordinates[1];
	var destHeight = destination.offsetHeight;
	var destWidth = destination.offsetWidth;
	var h = parseInt(destHeight/this.grid.length); //Tile Height
	var w = parseInt(destWidth/this.grid[0].length); //Tile Width

	return [x*w,y*h];
}

Viewer.prototype.bindMovement = bindMovement;

//Takes a unit to be moved and a target destination (as an array [row, column]).
//Binds the appropriate movement function to the destination tile.
//If an enemy is present it will be 
function bindMovement(unit, target){
	//Unit's position stored as [row, col]
	var targetRow = target[0];
	var targetCol = target[1];

	//The DOM element for the destination tile.
	var destTile = this.tiles[targetRow][targetCol];
	destTile.className += " movementTile";
	
	var f = function(){
		//New coordinates as pixels
		unit.displayElement.style.left = parseFloat(destTile.style.left)+(100/this.tiles[0].length/2.5)+"%";
		unit.displayElement.style.bottom = parseFloat(destTile.style.bottom)+(100/this.tiles.length/2.5)+"%";
		this.board.move(unit,target);
		this.resetBindings();
	};

	destTile.onclick = f.bind(this);
}

Viewer.prototype.resetBindings = resetBindings;
//Resets the controls on all tiles.
function resetBindings(){

	for(var row = 0; row < this.tiles.length; row++){
		for(var col = 0; col < this.tiles[0].length; col++){
			var cur = this.tiles[row][col];

			//Unbind click functions.
			cur.onclick = null;

			//Remove movement highlighting.
			cur.className = cur.className.replace(/(?:^|\s)movementTile(?!\S)/g,'');
			cur.className = cur.className.replace(/(?:^|\s)occupied(?!\S)/g,'');

			//Re-bind movePath function
			if(this.board.grid[row][col]){
				var unit = this.board.grid[row][col];

				if(window.game.turn == unit.owner){
					cur.onclick = unit.movementPath.bind(unit);
				}
				cur.className += " occupied";
			}
		}
	}
}

Viewer.prototype.erase = erase;
//Erases a unit from the DOM.
function erase(unit){
	this.destination.removeChild(unit.displayElement);
	unit.displayElement = null;
}

Viewer.prototype.updateTurn = function(){
	var turnDisplay = document.getElementById("turn_display");
	turnDisplay.innerHTML = "It's Player "+window.game.turn+"'s Turn";
}

Viewer.prototype.displayGameOver = function(winner){
	var turnDisplay = document.getElementById("turn_display");
	var p = document.createElement("p");
	p.innerHTML = "GAME OVER";
	var winnerName = document.createElement("p");
	winnerName.innerHTML = "Player "+winner+" is Victorious!";

	turnDisplay.innerHTML = "";
	turnDisplay.appendChild(p);
	turnDisplay.appendChild(winnerName);
};