"use strict";

var module = module || {};

function Card(rank, suit, hidden) {
	this.rank = rank;
	this.suit = suit;
}

Card.prototype.value = function() {

	var r = this.rank;

	if (r === "a")
		return 14;

	if (r === "k")
	  return 13;

	if (r === "q")
	  return 12;

	if (r === "j")
		return 11;

	r = parseInt(r);

	if (r <= 10 && r > 1)
		return r;

	return -1;
}

Card.prototype.suitValue = function() {
	var s = this.suit;

	if(s === "spades")
	  return 4;

	if(s === "hearts")
		 return 3;

	if(s === "clubs")
		return 2;

	if(s === "diams")
		return 1;
}

module.exports = Card;
