"use strict";

var module = module || {};
var require = require || function() {};
var __dirname = __dirname || "";

// Module dependency for node.js
var Hand = require(__dirname + "/Hand");

function Player(id, sid, name, hand) {
	this.id = id;
	this.sid = sid;
	this.name = name;
	this.hand = hand;
}

module.exports = Player;
