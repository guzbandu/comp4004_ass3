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
	displayHeldHand(data.playerID, data.handID);
	if (localPlayer && data.playerID != localPlayer.id)
		notify(data.playerName+", hand "+data.handID+" is holding", 2);
}

// data: {playerID, handID, playerName, card (not needed)}
//
function handleBust(data) {
	displayBustedHand(data.playerID, data.handID);

	var message = data.playerName+", hand "+data.handID+" has bust";
	if (localPlayer && data.playerID === localPlayer.id)
		message = "Your hand " + data.handID + " is bust!";

	notify(message, 2);
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

// data: {winnerID, details}
//
function handleGameOver(data) {
	var player = localPlayer && data.winnerID === localPlayer.id
			   ? "You have"
		       : "Player " + data.winnerID + " has";
	notify(player + " won! " + data.details, null);
	firstJoinOfGame = true;

	displayGameMenu();
	updateSlotCount(MAX_PLAYERS);
}

function handleNewPlayer(player) {
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

// data: {playerID, handID}
function turn(data) {

	displayTurnIndicator(data.playerID, data.handID);

	if (localPlayer && data.playerID === localPlayer.id) {
		round++;
		enableControls(data.handID);
	}
}

function exchange(handID, cards) {
	disableControls();
	server.emit("exchange", handID, cards);
}

function hold(handID) {
	disableControls();
	server.emit("hold", handID);
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

// Return whether or not this hand is elgibible for a split
function canSplit(hand) {
	if (!hand)
		return false;

	return round === 1 &&
		   hand.showing.length === 1 &&
		   hand.faceDown.rank === hand.showing[0].rank;
}

// Send add AI request message to server
//
function requestNewPlayer() {
	server.emit("addAI");
}

window.onload = function() {
	main();
}
