//Creates a new ai with the given difficulty level.
function AI(difficulty){
	this.difficulty = difficulty;
}

AI.prototype.predict = function(){
	//Placeholder
};

//Returns all possible moves for a turn on te given board with for the given player.
AI.prototype.getMoves = function(activeBoard, activePlayer){
	var grid  = window.game.boards[activeBoard].grid;
	var possibleMoves = new Array(); // Format: [[unit,arrayOfMoves],...]
	//Get units on board.
	for(var row = 0; row < grid.length; row++){
		for(var col = 0; col < grid[row].length; col++){
			curUnit = grid[row][col];

			//Get moves for relavent units.
			if(curUnit && curUnit.owner == activePlayer){
				var moves = curUnit.movementPath("predict");
				possibleMoves.push([curUnit,moves]);
			}
		}
	}
	return possibleMoves;
};