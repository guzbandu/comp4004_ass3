"use strict";

// Note: this is not currently compatible with the browser

var exports = exports || {};
var require = require || function() {};

var moment = require('moment');

function logit(log, level) {
	console.log("[" + logTimeStamp() + " " + level + "]:  " + log);
}

function logTimeStamp() {
	return moment().format('MMMM Do YYYY, h:mm:ssa');
}

exports.debug = function(log) {
	logit(log, "DEBUG");
};

exports.info = function(log) {
	logit(log, "INFO");
};