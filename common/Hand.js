"use strict";

var modle = module || {};

function Hand(id) {
	this.id = id; // Hand id
	this.showing = []; // List of face up cards
	this.faceDown = []; // List of all face down cards
	this.holding = false;
	this.exchanged = false;
}

// Add a card to the hand
Hand.prototype.addCard = function(faceUp, card) {
	if(faceUp)
		this.showing.push(card);
	else {
	  card.hidden=true;
		this.faceDown.push(card);
	}
};

Hand.prototype.rank = function() {
	this.cards = this.faceDown.concat(this.showing);
	this.cards.sort(function(a,b) {return a.value()-b.value()});

	if(this.checkForStraight()&&this.checkForFlush()) {
		if(this.cards[0]===10) {
			return "royalflush";
		} else {
			return "straightflush"
		}
	}
	if(this.checkForFour()) { return "four" }
	if(this.checkForFullHouse()) { return "fullhouse" }
	if(this.checkForFlush()) { return "flush" }
	if(this.checkForStraight()) { return "straight" }
	if(this.checkForTriple()) { return "triple" }
	if(this.checkForDouble()) { return "double" }
	return "single";
}

Hand.prototype.checkForFour = function() {
	if(this.cards[1].value()===this.cards[2].value()&&this.cards[2].value()===this.cards[3].value()) {
		if(this.cards[0].value()===this.cards[1].value() || this.cards[4].value()===this.cards[1].value()) {
			return true;
		}
	}
	return false;
}

Hand.prototype.checkForFullHouse = function() {
	if(this.cards[0].value()===this.cards[1].value()&&this.cards[3].value()===this.cards[4].value()) {
		if(this.cards[2].value()===this.cards[1].value() || this.cards[2].value()===this.cards[3].value()) {
			return true;
		}
	}
	return false;
}

Hand.prototype.checkForFlush = function() {
	var flush = true;
	for(var i=0; i<this.cards.length-1; i++) {
		if(this.cards[i].suit !== (this.cards[i+1].suit)) {
			flush = false;
			break;
		}
	}
	return flush;
}

Hand.prototype.checkForStraight = function() {
	var straight = true;
	for(var i=0; i<this.cards.length-1; i++) {
		//console.log(this.cards[i].value()+""+this.cards[i+1].value()-1);
		if(this.cards[i].value() !== (this.cards[i+1].value()-1)) {
			//Special case for aces possibly being 1 not 14
			if(i===3 && this.cards[i].value() === 5 && this.cards[i+1].value() === 13 ) {
				//it is a straight with Ace low
				return true;
			}
			straight = false;
			break;
		}
	}
	return straight;
}

Hand.prototype.checkForTriple = function() {
	var triple = false;
	for(var i=0; i<this.cards.length-2; i++) {
		if(this.cards[i].value() === this.cards[i+1].value() && this.cards[i].value() === this.cards[i+2].value()) {
			triple=true;
			break;
		}
	}
	return triple;
}

Hand.prototype.checkForDouble = function() {
	var dbl = false;
	for(var i=0; i<this.cards.length-1; i++) {
		if(this.cards[i].value() === this.cards[i+1].value()) {
			dbl=true;
			break;
		}
	}
	return dbl;
}

Hand.prototype.rankValue = function() {
	//console.log("ranking the hand");
	var r = this.rank();
	console.log("the rank is "+r);

  if (r === "royalflush")
	  return 9;

  if (r === "straightflush")
	  return 8;

  if (r === "four")
	  return 7;

  if (r === "fullhouse")
	  return 6;

  if (r === "flush")
	  return 5;

  if (r === "straight")
	  return 4;

  if (r === "triple")
	  return 3;

  if (r === "double")
		return 2;

	if (r === "single")
		return 1;

	return 0; //something went wrong
}

Hand.prototype.getMatchingCardRank = function() {
	this.cards = this.faceDown.concat(this.showing);
	this.cards.sort(function(a,b) {return a.value()-b.value()});

	for(var i=0; i<this.cards.length-1; i++) {
		if(this.cards[i].value() === this.cards[i+1].value()) {
			return this.cards[i].rank;
		}
	}
	return -1; //something went wrong
}

Hand.prototype.getMatchingCardRankValue = function() {
	this.cards = this.faceDown.concat(this.showing);
	this.cards.sort(function(a,b) {return a.value()-b.value()});

	for(var i=0; i<this.cards.length-1; i++) {
		if(this.cards[i].value() === this.cards[i+1].value()) {
			return this.cards[i].value();
		}
	}
	return -1; //something went wrong
}

Hand.prototype.getMatchingCardSuitValue = function() {
	this.cards = this.faceDown.concat(this.showing);
	this.cards.sort(function(a,b) {return a.value()-b.value()});

	for(var i=0; i<this.cards.length-1; i++) {
		if(this.cards[i].value() === this.cards[i+1].value()) {
			return Math.max(this.cards[i].suitValue(), this.cards[i+1].suitValue());
		}
	}
	return -1; //something went wrong
}

Hand.prototype.makeAllVisible = function() {
	var faceDownCount = this.faceDown.length;
	for(var i=0; i<faceDownCount; i++) {
		var card = this.faceDown.pop();
		card.hidden=false;
		this.showing.push(card);
		console.log("moved a card from faceDown to showing "+card);
	}
};

Hand.prototype.highestCardsRankValue = function() {
	var r = this.rank();
	this.cards = this.faceDown.concat(this.showing);
	this.cards.sort(function(a,b) {return a.value()-b.value()});

	if (r === "royalflush")
	  return this.cards[4].value();

  if (r === "straightflush") {
	  if(this.cards[4]===13) {return this.cards[3].value()}
		else {return this.cards(4).value()}
	}

  if (r === "four")
	  return this.cards[2].value();

  if (r === "fullhouse")
	  return this.cards[2].value();

  if (r === "flush")
	  return this.cards[4].value();

  if (r === "straight"){
	  if(this.cards[4]===13) {return this.cards[3].value()}
		else {return this.cards[4].value()}
	}

  if (r === "three")
	  return this.getMatchingCardRankValue();

  if (r === "two")
		return this.getMatchingCardRankValue();

	if (r === "single")
		return this.cards[4].value();

}

Hand.prototype.highestCardsSuitValue = function() {
	var r = this.rank();
	this.cards = this.faceDown.concat(this.showing);
	this.cards.sort(function(a,b) {return a.value()-b.value()});

	if (r === "royalflush")
	  return this.cards[4].suitValue();

  if (r === "straightflush") {
	  if(this.cards[4]===13) {return this.cards[3].suitValue()}
		else {return this.cards[4].suitValue()}
	}

  if (r === "four")
	  return this.cards[2].suitValue();

  if (r === "fullhouse")
	  return this.cards[2].suitValue();

  if (r === "flush")
	  return this.cards[4].suitValue();

  if (r === "straight"){
	  if(this.cards[4]===13) {return this.cards[3].suitValue()}
		else {return this.cards[4].suitValue()}
	}

  if (r === "three")
	  return this.getMatchingCardSuitValue();

  if (r === "two")
		return this.getMatchingCardSuitValue();

	if (r === "single")
		return this.cards[4].suitValue();

}

module.exports = Hand;
