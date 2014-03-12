//Super-class for all units.
function Unit(owner, row, col){

	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;

	//The display sprite for this unit.
	this.sprite = document.createTextNode("I AM DEATH");
	//Number of spaces the unit can move in a single turn.
	this.speed = 0;

	//Mobility is a boolean array of which directions the unit may move.
	//Eight directions in clockwise order:
	//[Up, Up-Right, Right, Down-Right, Down, etc.]
	this.mobility = [0,0,0,0,0,0,0,0];

	//Will the unit ignore friendly units
	//when checking for collisions?
	this.ignoreFriendly = false;
}

King.prototype = new Unit();
King.prototype.constructor= King;
function King(owner, row, col){

	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("K");
	this.speed = 1;
	this.mobility = [1,1,1,1,1,1,1,1];
}

Queen.prototype = new Unit();
Queen.prototype.constructor= Queen;
function Queen(owner, row, col){
	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("Q");
	this.speed = 8;
	this.mobility = [1,1,1,1,1,1,1,1];
}

Bishop.prototype = new Unit();
Bishop.prototype.constructor= Bishop;
function Bishop(owner, row, col){
	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("B");
	this.speed = 8;
	this.mobility = [0,1,0,1,0,1,0,1];
}

Knight.prototype = new Unit();
Knight.prototype.constructor= Knight;
function Knight(owner, row, col){
	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("Kn");
	this.speed = 3;
	this.mobility = [1,0,1,0,1,0,1,0];
	this.ignoreFriendly = true;
	//Need to handle L-Movement.
}

Rook.prototype = new Unit();
Rook.prototype.constructor= Rook;
function Rook(owner, row, col){
	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("R");
	this.speed = 8;
	this.mobility = [1,0,1,0,1,0,1,0];
}

Pawn.prototype = new Unit();
Pawn.prototype.constructor= Pawn;
function Pawn(owner, row, col){
	this.owner = owner;
	this.position = [row, col];
	this.experience = 0;
	this.sprite = document.createTextNode("P");
	this.speed = 1;
	this.mobility = [1,0,0,0,0,0,0,0];
	this.firstMove = true;
	//If firstMove, speed = 2. If enemy is diagonal, pawn can attack.
}