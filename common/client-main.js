// Player controlled by local user
var localPlayer = null;
var serverAddr = "http://localhost:8889";
var server = null; // Socket.io
var round = 0; // Current round
var firstJoinOfGame = true;

// Constants
var MAX_PLAYERS = 4;

function main(args) {

	connectToServer();
}

// Request a place in the game. Response is either getting a welcome
// message or being disconnected from the server
function joinGame() {
	notify("Waiting for Player(s)...", 0);
	server.emit("joinGame");
}

function connectToServer() {

	server = io.connect(serverAddr, {
		'transports': ["websocket"]
	});

	server.on("connect", handleConnection);
	server.on("disconnect", handleDisconnect);
	server.on("welcome", welcome);

	registerGameEvents();

	// Try to join the game
	displayGameMenu();
}

function registerGameEvents() {
	server.on("exchange", handleExchange);
	server.on("hold", handleHold);
	server.on("notifyGameRanking", handleGameRanking);
	server.on("gameOver", handleGameOver);
	server.on("newPlayer", handleNewPlayer);
	server.on("playerLeft", handlePlayerLeft);
	server.on("showPlayer", handleShowPlayer);
	server.on("turn", turn);
	server.on("countDown", handleCountDown);
	server.on("gameStarted", gameStarted);
	server.on("gameFull", handleGameFull);
}

function handleConnection() {
	// Make sure the table isn't showing previous game data
	clearTable();
	updateSlotCount(MAX_PLAYERS)
	console.log("Connected to server");
}

function handleDisconnect() {
	console.log("Disconnect");
	console.warn("Disconnected from server");
	warn("You have been disconnected from the server", null);
	clearWinnerResults();
	hideMenus();
}

// Set the local player to the one provided
function setPlayer(player) {
	localPlayer = player;
	localPlayer.name = "You";
}

// data: {player, handID}
function handleExchange(data) {
  console.log("Handling exchange");
	removeCardsFromTable(data.player.id);
	drawHands(data.player);
}

// data: {playerID, handID, playerName}
function handleHold(data) {
	if (localPlayer && data.playerID != localPlayer.id)
		notify(data.playerName+", hand "+data.handID+" is holding", 2);
}

// Handle any view updates associated with a new player entering
//
function playerAdded(player) {
	deductSlotCount();

	if (firstJoinOfGame) {
		clearTable();
		firstJoinOfGame = false;
	}

	drawHands(player);
}

// data: playerName, playerRank
//
function handleGameRanking(data) {
	postResultLine(data.playerName,data.playerRank);
}

function handleGameOver(data) {

	localPlayer = null;
	firstJoinOfGame = true;

	disableControls();
	displayGameMenu();
	updateSlotCount(MAX_PLAYERS);
}

function handleNewPlayer(player) {
	clearWinnerResults();
	notify(player.name + " has joined the game", 2);
	console.log("New player " + JSON.stringify(player));
	playerAdded(player);
}

function handlePlayerLeft(id) {
	notify("Player " + id + " has left the game", 2);
	incrementSlotCount();
	removePlayerFromTable(id);
}

function handleShowPlayer(player) {
	console.log("Showing player " + JSON.stringify(player));
	removeCardsFromTable(player.id);
	drawHands(player);
}

// Notify the view of the countdown to the game starting
function handleCountDown(seconds) {

	// Base case
	if (seconds <= 0)
		return;

	notify("Game starts in " + seconds + " seconds", 1.2);

	setTimeout(function() {
		// Abort the countdown if a warning is present
		if (logLevel() !== "warn")
			handleCountDown(seconds - 1);

	}, 1000);
}

function welcome(player) {

	notify(player.name + " has joined the game", 2);

	setPlayer(player);
	console.log("We are player " + localPlayer.id
			  + ": " + JSON.stringify(localPlayer));

	playerAdded(localPlayer);
}

// data: {playerID, handID, testMode}
function turn(data) {

	console.log("displayTurnIndicator about to be called");

	displayTurnIndicator(data.playerID, data.handID);

	if (localPlayer && data.playerID === localPlayer.id) {
		round++;
		enableControls(data.playerID, data.handID);
	}
	if(data.testMode)
	  enableControls(data.playerID, data.handID);
}

function exchange(playerID, handID) {
	var cards = $("#selectable").children();
	var selectedCards = [];
	for(var i=0; i<cards.length; i++) {
		if($( cards[i] ).hasClass("ui-selected")) {
			selectedCards.push($( cards[i] ).attr('class'));
		}
	}
	disableControls();
	server.emit("exchange", playerID, handID, selectedCards);
}

function hold(playerSID, handID) {
	disableControls();
	server.emit("hold", playerSID, handID);
}

// Reset game attributes. TODO: actually encapsulate these into a game object
// to manage games
//
function gameStarted() {
	round = 0;
	hideMenus();
	console.log("Game started!");
}

function handleGameFull() {
	updateSlotCount(0);
	displayGameFull();
}

// Send add AI request message to server
//
function requestNewPlayer() {
	server.emit("addAI");
}

window.onload = function() {
	main();
}

// For testing purposes submit a hand for a human player to start with
function addHumanTest() {
	console.log("Adding a human while testing"+$('input[name="n1-r"]').val());
	var rank1 = $('input[name="n1-r"]').val();
	var suit1 = $('input[name="n1-s"]').val();
	var rank2 = $('input[name="n2-r"]').val();
	var suit2 = $('input[name="n2-s"]').val();
	var rank3 = $('input[name="n3-r"]').val();
	var suit3 = $('input[name="n3-s"]').val();
	var rank4 = $('input[name="n4-r"]').val();
	var suit4 = $('input[name="n4-s"]').val();
	var rank5 = $('input[name="n5-r"]').val();
	var suit5 = $('input[name="n5-s"]').val();
	var inputs = document.getElementsByClassName("test");
	for (i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
  }
	server.emit("addHumanTest", rank1, suit1, rank2, suit2, rank3, suit3, rank4, suit4, rank5, suit5);
}

function addAITest() {
	console.log("Adding an AI while testing");
	var rank1 = $('input[name="n1-r"]').val();
	var suit1 = $('input[name="n1-s"]').val();
	var rank2 = $('input[name="n2-r"]').val();
	var suit2 = $('input[name="n2-s"]').val();
	var rank3 = $('input[name="n3-r"]').val();
	var suit3 = $('input[name="n3-s"]').val();
	var rank4 = $('input[name="n4-r"]').val();
	var suit4 = $('input[name="n4-s"]').val();
	var rank5 = $('input[name="n5-r"]').val();
	var suit5 = $('input[name="n5-s"]').val();
	var inputs = document.getElementsByClassName("test");
	for (i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
  }
	server.emit("addAITest", rank1, suit1, rank2, suit2, rank3, suit3, rank4, suit4, rank5, suit5);
}

// For testing purposes control what cards a player gets when they exchange cards
function exchangeHumanTest() {
	var playerid = $('input[name="playerid"]').val();
	console.log("The playername is:"+$('input[name="playerid"]').val());
	var rankn1 = $('input[name="n1-r"]').val();
	console.log("n1-r:"+$('input[name="n1-r"]').val());
	var suitn1 = $('input[name="n1-s"]').val();
	console.log("n1-s:"+$('input[name="n1-s"]').val());
	var rankn2 = $('input[name="n2-r"]').val();
	var suitn2 = $('input[name="n2-s"]').val();
	var rankn3 = $('input[name="n3-r"]').val();
	var suitn3 = $('input[name="n3-s"]').val();
	console.log("n3-s:"+$('input[name="n3-s"]').val());
	var rankn4 = $('input[name="n4-r"]').val();
	var suitn4 = $('input[name="n4-s"]').val();
	var rankn5 = $('input[name="n5-r"]').val();
	var suitn5 = $('input[name="n5-s"]').val();
	var ranko1 = $('input[name="o1-r"]').val();
	console.log("o1-r:"+$('input[name="o1-r"]').val());
	var suito1 = $('input[name="o1-s"]').val();
	console.log("o1-s:"+$('input[name="o1-s"]').val());
	var ranko2 = $('input[name="o2-r"]').val();
	var suito2 = $('input[name="o2-s"]').val();
	var ranko3 = $('input[name="o3-r"]').val();
	var suito3 = $('input[name="o3-s"]').val();
	var ranko4 = $('input[name="o4-r"]').val();
	var suito4 = $('input[name="o4-s"]').val();
	var ranko5 = $('input[name="o5-r"]').val();
	var suito5 = $('input[name="o5-s"]').val();
	console.log("o3-s:"+$('input[name="o3-s"]').val());
	var inputs = document.getElementsByClassName("test");
	for (i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
  }
	server.emit("exchangeHumanTest", playerid, rankn1, suitn1, rankn2, suitn2, rankn3, suitn3, rankn4, suitn4, rankn5, suitn5, ranko1, suito1, ranko2, suito2, ranko3, suito3, ranko4, suito4, ranko5, suito5);
}

function addAIExchangeTest() {
	var playerid = $('input[name="playerid"]').val();
	console.log("The playername is:"+$('input[name="playerid"]').val());
	var rankn1 = $('input[name="n1-r"]').val();
	console.log("n1-r:"+$('input[name="n1-r"]').val());
	var suitn1 = $('input[name="n1-s"]').val();
	console.log("n1-s:"+$('input[name="n1-s"]').val());
	var rankn2 = $('input[name="n2-r"]').val();
	var suitn2 = $('input[name="n2-s"]').val();
	var rankn3 = $('input[name="n3-r"]').val();
	var suitn3 = $('input[name="n3-s"]').val();
	console.log("n3-s:"+$('input[name="n3-s"]').val());
	var rankn4 = $('input[name="n4-r"]').val();
	var suitn4 = $('input[name="n4-s"]').val();
	var rankn5 = $('input[name="n5-r"]').val();
	var suitn5 = $('input[name="n5-s"]').val();
	var ranko1 = $('input[name="o1-r"]').val();
	console.log("o1-r:"+$('input[name="o1-r"]').val());
	var suito1 = $('input[name="o1-s"]').val();
	console.log("o1-s:"+$('input[name="o1-s"]').val());
	var ranko2 = $('input[name="o2-r"]').val();
	var suito2 = $('input[name="o2-s"]').val();
	var ranko3 = $('input[name="o3-r"]').val();
	var suito3 = $('input[name="o3-s"]').val();
	var ranko4 = $('input[name="o4-r"]').val();
	var suito4 = $('input[name="o4-s"]').val();
	var ranko5 = $('input[name="o5-r"]').val();
	var suito5 = $('input[name="o5-s"]').val();
	console.log("o3-s:"+$('input[name="o3-s"]').val());
	var inputs = document.getElementsByClassName("test");
	for (i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
  }
	server.emit("exchangeAITest", playerid, rankn1, suitn1, rankn2, suitn2, rankn3, suitn3, rankn4, suitn4, rankn5, suitn5, ranko1, suito1, ranko2, suito2, ranko3, suito3, ranko4, suito4, ranko5, suito5);
}
