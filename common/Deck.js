"use strict";

var module = module || {};
var require = require || function() {};
var __dirname = __dirname || "";

// Module dependency for node.js
var Card = require(__dirname + "/Card");

function Deck() {
	var ranks = ["a", "2", "3", "4", "5", "6", "7",
				 "8", "9", "10", "j", "q", "k"];
	var suits = ["hearts", "spades", "diams", "clubs"];
	var that = this;

	// Create the empty deck
	this.deck = [];

	// Create 52 cards
	ranks.forEach(function(rank) {
		suits.forEach(function(suit) {
			that.deck.push(new Card(rank, suit, false));
		});
	});

	// shuffle the deck
	this.shuffle();
}

// Destructive shuffle function implementing Fisher-Yates algorithm
// taken from: http://stackoverflow.com/questions/2450954/
Deck.prototype.shuffle = function() {

	var currentIndex = this.deck.length;
	var tmpElement;
	var randomIndex;

	// While there are unshuffled elements
	while (currentIndex) {

		// Pick a random index
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// Swap the random index element with the current one
		tmpElement = this.deck[currentIndex];
		this.deck[currentIndex] = this.deck[randomIndex];
		this.deck[randomIndex] = tmpElement;
	}
}

// Get a random card, removing it from the deck
Deck.prototype.getCard = function() {
	// Deck already shuffled, making pop suitable for getting and removing a
	// random card
	return this.deck.pop();
	//return new Card("2", "spades"); // For testing split
}

//Find the card "we are fixing the AI with" and remove it from the deck
//This is used for testing only
Deck.prototype.removeCard = function(card) {
	console.log("removing card from deck"+card.rank+card.suit);
	for(var i=0; i<this.deck.length; i++) {
		if(this.deck[i].rank === card.rank && this.deck[i].suit === card.suit)
			this.deck.splice(i,1); //remove the card so it won't be dealt out while it is already in play this game
	}
}

module.exports = Deck;
