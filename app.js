//This application was based on a BlackJack application written by Zach R. and provided to us as an example in class
//It has been heavily modified since this is a poker game not blackjack.
//The "Deck" logic and css remain from the original application.
//The overall application architecture is based on and similar to the original application.

var express = require ('express');
var app = express();
var session = require('express-session')({
  secret: 'when will i be done',
  resave: true,
  saveUninitialized: true
});
var http = require('http').Server(app);
var port = 8080;
var io = require('socket.io')(http);
var sharedsession = require('express-socket.io-session');
const uuidv4 = require('uuid/v4');
var favicon = require('serve-favicon');
var url = require('url');

//Server variables
var deck,
    gameStarted,
    countDownStarted,
    clients,
    clientCount,
    availableIDs,
    currentTurn,
    currentHandTurn,
    playerScores = [],
    gameWinner = {},
    testingMode;

//Changed during testing mode
var AI_TURN_TIME = 3500; // Milliseconds for AI's to play
var TIME_LENGTH = 1000; // Milliseconds for Game count down

//Constants
var FACEDOWN = false;
var FACEUP = true;
var MIN_PLAYERS = 2;
var AIs = []; // Map of AI object to playerIDs

//Local Objects
var logger = require(__dirname + "/common/Logger");
var Player = require(__dirname + "/common/Player");
var Hand = require(__dirname + "/common/Hand");
var Card = require(__dirname + "/common/Card");
var Deck = require(__dirname + "/common/Deck");

io.use(sharedsession(session, {
  autoSave: true
}));

app.set('views', __dirname + '/public/views');
app.use("/common", express.static(__dirname + "/common"));
app.use("/views", express.static(__dirname + "/views"));
app.use("/public", express.static(__dirname + "/public"));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(session);

app.get("/", function(req, res) {
  req.session.userid = uuidv4();
	res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/flush-game", function(req, res) {
	logger.info("Flushing game");

	// Disconnect all existing clients
	for (var c in clients) {
		if (clients[c].connection) {
			clients[c].connection.disconnect();
		}
	}

	// Reset
  resetGame();

  testingMode = true;

	res.writeHead(200);
	res.end();
});

app.get("/api/prep-game", function(req, res) {
	logger.info("Resetting game");

	// Disconnect all existing clients
	for (var c in clients) {
		if (clients[c].connection) {
			clients[c].connection.disconnect();
		}
	}

	// Reset
  resetGame();

  testingMode = false;

	res.writeHead(200);
	res.end();
});

//Start the servers
http.listen(port, function(){
  logger.debug('listening on port:'+port);
});
socket = io.listen(8889);
socket.set("transports", "websocket");

//Wait for the intial client connection
socket.sockets.on('connection', function(client){
  client.on("exchangeAITest", exchangeAITest);
  client.on("addAITest", addAITest);
  client.on("exchangeHumanTest", exchangeHumanTest);
  client.on("addHumanTest", addHumanTest);
  client.on("exchange", handleExchange);
  client.on("hold", handleHold);
  client.on("addAI", addAI);
  client.on("joinGame", function() {
		handleJoinGame(client)
	});
});

//Initialize the game state
resetGame();

function handleExchange(userid, handID, cards) {
  logger.debug("handle exchange called: "+userid);
  var player = clients[userid];
	if (!player)
		return false;

	// Verify request is not spoofed
	if (!requestByCurrentTurn(player.player, handID)) {
    logger.debug("handleExchange requestByCurrentTurn failed");
    return;
  }

  for(var i=0; i<cards.length; i++) {
    logger.debug("card");
    //console.log("player exists"+client.player.hand.showing);
    startNum = player.player.hand.faceDown.length-1;
    for(var j=startNum; j>=0; j--) {
      logger.debug(player.player.hand.faceDown[j].rank+player.player.hand.faceDown[j].suit+cards[i]);
      //check if the rank and suit match
      if(cards[i].indexOf("-"+player.player.hand.faceDown[j].rank) !== -1 && cards[i].indexOf(player.player.hand.faceDown[j].suit) !== -1) {
        logger.debug("dropped a card"+j);
        player.player.hand.faceDown.splice(j,1);
      }
    }
  }

  for(var i=0; i<cards.length; i++) {
    logger.debug("Added a card");
    player.player.hand.addCard(FACEUP, deck.getCard());
  }
  player.player.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  player.player.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  player.player.hand.exchanged=true;

  // Notify players of the current turn
  socket.sockets.emit("exchange", {
    "player": player.player,
    "handID": currentHandTurn
  });

  // Set who plays next
  callNextTurn();

  playTurn();
}

// Client requested a hold for the game
//
function handleHold(userid, handID) {
  logger.debug("handle hold called: "+userid+" handID: "+handID);
	var player = clients[userid];
	if (!player) {
    logger.debug("In hold could not find client"+userid)
    return false;
  }

  logger.debug("requestByCurrentTurn:"+requestByCurrentTurn(player.player, handID))
  // Verify request is not spoofed
	if (!requestByCurrentTurn(player.player, handID)) {
    logger.debug("failed requestByCurrentTurn check");
    return;
  }


  logger.debug("holding "+player.player.hand.holding);
	player.player.hand.holding = true;
  logger.debug("holding "+player.player.hand.holding);

	socket.sockets.emit("hold", {
		"playerID": currentTurn,
		"handID": currentHandTurn,
		"playerName": player.player.name
	});

	logger.debug("hold");

  // Set who plays next
  callNextTurn();

  playTurn();
}

function handleJoinGame(client) {
  var newSystemID = client.handshake.session.userid;
  logger.debug('A user connected ID: '+newSystemID);

  //Add new human player, deal them a hand, welcome them
  if(newSystemID!=undefined) {
    // Only supporting one game at a time. If we've reached the player
    // limit, reject incoming request
    if (gameStarted || availableIDs.length == 0) {
      // Reject
      logger.debug("Rejecting client " + client.id);
      client.disconnect();
      return;
    }

    welcome(client);

    clientCount++;

    // The start condition
    if (clientCount >= MIN_PLAYERS) {
      startGame();
    }
  }

}

function exchangeAITest(playerid, rank1, suit1, rank2, suit2, rank3, suit3, rank4, suit4, rank5, suit5, ranke1, suite1, ranke2, suite2, ranke3, suite3, ranke4, suite4, ranke5, suite5) {
  logger.debug("the playerid is:"+playerid);
  playerID = parseInt(playerid);
  var client = clients[playerID];
  newCards = [];
  var card1 = new Card(rank1, suit1);
  newCards.push(card1);
  if(rank2!=""&&suit2!="") {
    var card2 = new Card(rank2, suit2);
    newCards.push(card2);
  }
  if(rank3!=""&&suit3!="") {
    logger.debug("suit3: "+suit3);
    var card3 = new Card(rank3, suit3);
    newCards.push(card3);
  }
  if(rank4!=""&&suit4!="") {
    var card4 = new Card(rank4, suit4);
    newCards.push(card4);
  }
  if(rank5!=""&&suit5!="") {
    var card5 = new Card(rank5, suit5);
    newCards.push(card5);
  }

  oldCards = [];
  var card6 = new Card(ranke1, suite1);
  oldCards.push(card6);
  if(ranke2!=""&&suite2!="") {
    var card7 = new Card(ranke2, suite2);
    oldCards.push(card7);
  }
  if(ranke3!=""&&suite3!="") {
    logger.debug("suite3: "+suite3);
    var card8 = new Card(ranke3, suite3);
    oldCards.push(card8);
  }
  if(ranke4!=""&&suite4!="") {
    var card9 = new Card(ranke4, suite4);
    oldCards.push(card9);
  }
  if(ranke5!=""&&suite5!="") {
    var card10 = new Card(ranke5, suite5);
    oldCards.push(card10);
  }

  logger.debug("oldCards.length"+oldCards.length+" client.player.hand.faceDown.length"+client.player.hand.faceDown.length);
  for(var i=0; i<oldCards.length; i++) {
    logger.debug("oldCards[i].rank"+oldCards[i].rank+" oldCards[i].suit"+oldCards[i].suit);
    for(var j=0; j<client.player.hand.faceDown.length; j++) {
      logger.debug("     oldCards[i].rank"+oldCards[i].rank+" client.player.hand.faceDown[j].rank"+client.player.hand.faceDown[j].rank+" oldCards[i].suit"+oldCards[i].suit+" client.player.hand.faceDown[j].suit"+client.player.hand.faceDown[j].suit);
      if(oldCards[i].rank === client.player.hand.faceDown[j].rank && oldCards[i].suit === client.player.hand.faceDown[j].suit) {
        logger.debug("matched the card, discarding it");
        client.player.hand.faceDown.splice(j,1);
      }
    }
  }

  for(var i=0; i<newCards.length; i++) {
    logger.debug("i:"+i+" newCards[i].rank"+newCards[i].rank+" newCards[i].suit"+newCards[i].suit);
    client.player.hand.addCard(FACEUP, newCards[i]);
  }
  client.player.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  client.player.hand.exchanged=true;
  client.player.hand.waitingForSelenium=false;

  // Notify players of the current turn
  socket.sockets.emit("exchange", {
    "player": client.player,
    "handID": currentHandTurn
  });

  logger.debug("ending exchangeAITest calling callNextTurn()");
  // Set who plays next
  callNextTurn();

  logger.debug("ending exchangeAITest calling playTurn()");
  playTurn();
}

//TODO
//For testing only "rig" the players exchange cards
function exchangeHumanTest(playerid, rank1, suit1, rank2, suit2, rank3, suit3, rank4, suit4, rank5, suit5, ranke1, suite1, ranke2, suite2, ranke3, suite3, ranke4, suite4, ranke5, suite5) {
  logger.debug("the playerid is:"+playerid);
  playerID = parseInt(playerid);
  var client = clients[playerID];
  newCards = [];
  var card1 = new Card(rank1, suit1);
  newCards.push(card1);
  if(rank2!=""&&suit2!="") {
    var card2 = new Card(rank2, suit2);
    newCards.push(card2);
  }
  if(rank3!=""&&suit3!="") {
    logger.debug("suit3: "+suit3);
    var card3 = new Card(rank3, suit3);
    newCards.push(card3);
  }
  if(rank4!=""&&suit4!="") {
    var card4 = new Card(rank4, suit4);
    newCards.push(card4);
  }
  if(rank5!=""&&suit5!="") {
    var card5 = new Card(rank5, suit5);
    newCards.push(card5);
  }

  oldCards = [];
  var card6 = new Card(ranke1, suite1);
  oldCards.push(card6);
  if(ranke2!=""&&suite2!="") {
    var card7 = new Card(ranke2, suite2);
    oldCards.push(card7);
  }
  if(ranke3!=""&&suite3!="") {
    logger.debug("suite3: "+suite3);
    var card8 = new Card(ranke3, suite3);
    oldCards.push(card8);
  }
  if(ranke4!=""&&suite4!="") {
    var card9 = new Card(ranke4, suite4);
    oldCards.push(card9);
  }
  if(ranke5!=""&&suite5!="") {
    var card10 = new Card(ranke5, suite5);
    oldCards.push(card10);
  }

  logger.debug("oldCards.length"+oldCards.length+" client.player.hand.showing.length"+client.player.hand.showing.length);
  for(var i=0; i<oldCards.length; i++) {
    logger.debug("oldCards[i].rank"+oldCards[i].rank+" oldCards[i].suit"+oldCards[i].suit);
    for(var j=0; j<client.player.hand.showing.length; j++) {
      logger.debug("     oldCards[i].rank"+oldCards[i].rank+" client.player.hand.showing[j].rank"+client.player.hand.showing[j].rank+" oldCards[i].suit"+oldCards[i].suit+" client.player.hand.showing[j].suit"+client.player.hand.showing[j].suit);
      if(oldCards[i].rank === client.player.hand.showing[j].rank && oldCards[i].suit === client.player.hand.showing[j].suit) {
        logger.debug("matched the card, discarding it");
        client.player.hand.showing.splice(j,1);
      }
    }
  }

  for(var i=0; i<newCards.length; i++) {
    logger.debug("i:"+i+" newCards[i].rank"+newCards[i].rank+" newCards[i].suit"+newCards[i].suit);
    client.player.hand.addCard(FACEUP, newCards[i]);
  }
  client.player.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  client.player.hand.exchanged=true;

  // Notify players of the current turn
  socket.sockets.emit("exchange", {
    "player": client.player,
    "handID": currentHandTurn
  });

  // Set who plays next
  callNextTurn();

  playTurn();
}

//For testing only "rig" the players hand
function addHumanTest(rank1, suit1, rank2, suit2, rank3, suit3, rank4, suit4, rank5, suit5) {
  //Make everything go faster
  TIME_LENGTH = 500; //Game start time two and a half instead of five seconds

  sid = uuidv4();
  logger.debug('A test user request with sid: '+sid);

	var newPlayerID = availableIDs.pop();
  var newHand = new Hand(0);
	var newPlayer = new Player(newPlayerID, sid, "Player " + newPlayerID, newHand);
  newPlayer.hand.waitingForAI=true; //humans play after the AI's

  logger.debug("rank1"+rank1+" suit1"+suit1+" rank2"+rank2);

  var card1 = new Card(rank1, suit1);
  var card2 = new Card(rank2, suit2);
  var card3 = new Card(rank3, suit3);
  var card4 = new Card(rank4, suit4);
  var card5 = new Card(rank5, suit5);

  cards = [];
  cards.push(card1);
  cards.push(card2);
  cards.push(card3);
  cards.push(card4);
  cards.push(card5);

	// Give rigged hand to new player
  for(var i=0; i<cards.length; i++) {
    newPlayer.hand.addCard(FACEUP, cards[i]);
    deck.removeCard(cards[i]); //make certain the rigged card is no longer in the deck of cards
  }

  newPlayer.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  newPlayer.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  //testing - check the rank of the hand dealt
  console.log("rank: "+newPlayer.hand.rank());

	// Welcome player to the game with their id
	socket.sockets.emit("welcome", newPlayer);

	// Notify existing clients of new arrival
	broadcastPlayer("newPlayer", null, newPlayer)

	// Notify new player of all existing clients
	for (var c in clients) {
  		filterSendPlayer("newPlayer", null, clients[c].player);
	}

	// Map the new player to this client uid
	clients[newPlayer.id] = {
		"player": newPlayer,
		"playTurn": playerTurn
	};

  clientCount++;

  // The start condition
  if (clientCount >= MIN_PLAYERS) {
    startGame();
  }

}

// Add the player to the current game and notify clients as required
function welcome(client) {

	logger.info("New client: " + client.id);

	var newPlayerID = availableIDs.pop();
  var newSystemID = client.handshake.session.userid;
  var newHand = new Hand(0);
	var newPlayer = new Player(newPlayerID, newSystemID, "Player " + newPlayerID, newHand);
  newPlayer.hand.waitingForAI=true; //humans play after the AI's

	// Give hand to new player
	dealHand(newPlayer, FACEDOWN);

  newPlayer.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  newPlayer.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  // testing - check the rank of the hand dealt
  console.log("rank: "+newPlayer.hand.rank());

	// Welcome player to the game with their id
	client.emit("welcome", newPlayer);

	// Notify existing clients of new arrival
	broadcastPlayer("newPlayer", client, newPlayer)

	// Notify new player of all existing clients
	for (var c in clients) {
  		filterSendPlayer("newPlayer", client, clients[c].player);
	}

	// Map the new player and connection handle to this client uid
	clients[newPlayer.id] = {
		"player": newPlayer,
		"playTurn": playerTurn,
		"connection": client
	};
}

function filterSendPlayer(event, client, player) {
  if(testingMode) {
     socket.sockets.emit(event, player);
  } else {
	   client.emit(event, player);
  }
}

//The player makes all the decisions
function playerTurn() {
  logger.debug("In player turn");
}

function dealHand(player, visible) {
  for(i=0; i<5; i++)
    player.hand.addCard(visible, deck.getCard());
}

// Reset all game attributes to allow new joins
function resetGame() {
  console.log("Resetting all game attributes");
	deck = new Deck();
	gameStarted = false;
	countDownStarted = false;
	clients = []; // map of client UIDs to Player and network handle objects
	clientCount = 0;
  availableIDs = [4, 3, 2, 1];
	currentTurn = -1;
	currentHandTurn = 0;
  testingMode = false;
  AI_TURN_TIME = 3500; //Set back to normal game play in case testing has been going on
  TIME_LENGTH = 1000; //Set back to normal game play in case testing has been going on
}

function runGame() {

	logger.debug("Starting game!");

	socket.emit("gameStarted");

	gameStarted = true;

  // Set who plays next
  callNextTurn();

	playTurn();
}

function startGame() {

	if (countDownStarted)
		return;

	gameWinner = {};

	countDownStarted = true;

	var countDownSeconds = 5;

  logger.info("Starting game in "+countDownSeconds+" seconds...");
  logger.info("Time interval "+TIME_LENGTH);

	socket.sockets.emit("countDown", countDownSeconds);

	setTimeout(runGame, countDownSeconds * TIME_LENGTH);
}

function playTurn() {

  if (!gameStarted)
    return;

	logger.debug("playTurn(): player " + currentTurn + " hand " + currentHandTurn);

	var client = getClientByID(currentTurn);

	if (!client)
		return;

  logger.debug("playerSID "+client.player.sid);

  if(testingMode) {
  	// Notify players of the current turn
  	socket.sockets.emit("turn", {
  		"playerID": currentTurn,
  		"handID": currentHandTurn,
      "testMode": true
  	});
  } else {
    // Notify players of the current turn
    socket.sockets.emit("turn", {
      "playerID": currentTurn,
      "handID": currentHandTurn,
      "testMode": false
    });
  }

  // Set who plays next
  //TODO
  //callNextTurn();

	// Play the hand based on the player type
	client.playTurn();
}

// Returns the client object for the playerID provided, or null.
function getClientByID(id) {
	for (var c in clients) {
		if (clients[c].player.id === id) {
			return clients[c];
		}
	}
	return null;
}

function getClientList() {
  return clients;
}

// Add an AI player to the game
//
function addAI() {

	if (!availableIDs.length) {
		// No more room
		return;
	}

	logger.info("Adding AI");

	clientCount++;
	var playerID = availableIDs.pop();
  var newHand = new Hand(0);
	var ai = new Player(playerID, null, "Agent " + playerID, newHand);

	// Give hand to new player
	dealHand(ai, FACEDOWN);
  ai.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  ai.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  var aiClient = {
    "id": ai.id
  };

  // Map this player ID to the AI object
  AIs[ai.id] = aiClient;

  // Map the new player and connection handle to this client uid
  clients[aiClient.id] = {
    "player": ai,
    "playTurn": function() {
      setTimeout(AITurn, AI_TURN_TIME);
    },
    "connection": null
  };

  addAICommon(ai);

}

function addAITest(rank1, suit1, rank2, suit2, rank3, suit3, rank4, suit4, rank5, suit5) {
  if (!availableIDs.length) {
		// No more room
		return;
	}

	logger.info("Adding AI Test");

  var card1 = new Card(rank1, suit1);
  var card2 = new Card(rank2, suit2);
  var card3 = new Card(rank3, suit3);
  var card4 = new Card(rank4, suit4);
  var card5 = new Card(rank5, suit5);

  cards = [];
  cards.push(card1);
  cards.push(card2);
  cards.push(card3);
  cards.push(card4);
  cards.push(card5);

	clientCount++;
	var playerID = availableIDs.pop();
  var newHand = new Hand(0);
	var ai = new Player(playerID, null, "Agent " + playerID, newHand);

  for(var i=0; i<cards.length; i++) {
    ai.hand.addCard(FACEDOWN, cards[i]);
    deck.removeCard(cards[i]);
  }
  ai.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  ai.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  var aiClient = {
    "id": ai.id
  };

  // Map this player ID to the AI object
  AIs[ai.id] = aiClient;

  // Map the new player and connection handle to this client uid
  clients[aiClient.id] = {
    "player": ai,
    "playTurn": function() {
      setTimeout(AITurn, AI_TURN_TIME);
    },
    "connection": null
  };

  addAICommon(ai);

  //Make everything go faster
  AI_TURN_TIME = 500; //AI's turn takes 5 seconds instead of 3.5 seconds - give selenium a chance to request a
  TIME_LENGTH = 500; //Game start time is in hundreds of milliseconds instead of second
}

function addAICommon(ai) {
  // Notify existing clients of new player arrival
  broadcastPlayer("newPlayer", null, ai)

  // AI joining can trigger a game starting
  if (clientCount >= MIN_PLAYERS) {
    startGame();
  }

  if (!availableIDs.length) {
    socket.sockets.emit("gameFull");
  }
}

function broadcastPlayer(event, client, player) {
	if (client && client.broadcast) {
    logger.debug("registering new human player");
		client.broadcast.emit(event, player);
	} else {
    if(!testingMode) {
      logger.debug("registering new AI");
    }
    logger.debug("testingMode"+testingMode);
    logger.debug("event"+event);
    logger.debug("player"+player.id);
		socket.sockets.emit(event, player);
  }
}

// Verify that the current request was made by the player who's turn it is
// and that the handID matches the current turn hand.
function requestByCurrentTurn(player, handID) {
  logger.debug("playerid:"+player.id+" currentTurn:"+currentTurn+" handID:"+handID+"currentHandTurn"+currentHandTurn);
  logger.debug("player.id === currentTurn"+player.id === currentTurn);
  logger.debug("handID === currentHandTurn"+handID === currentHandTurn);
	return player.id === currentTurn && handID === currentHandTurn;
}

// The current turn belongs to an AI player. Handle their
// move and increment the turn
function AITurn() {

  if(currentTurn === -1)
    return;

	logger.debug("AIs turn: " + currentTurn);

  var client = getClientByID(currentTurn);
	if (!client) {
		logger.info("Something went wrong. AI player not found!");
		return;
	}

  logger.debug("The client.sid is: "+client.player.sid);

  if(client.player.sid !== null) {
    logger.debug("This is a human");
    return;
  }

	var player = client.player;

	var thisAi = AIs[player.id];
	if (!thisAi) {
		logger.info("Failed to retrieve this ai for player " + player.id);
		return;
	}

  for (var c in clients) {
		var opponent = clients[c].player;
    if(opponent.sid !== null) {
      logger.debug("This opponent is human");
    } else {
      logger.debug("This opponent is an AI");
      if(opponent.hand.checkForVisibleTriple()) {
        logger.debug("This AI is showing a visible triple execute strategy 2");
        executeStrategy2(player);
      }
    }
  }

  //If they have not executed strategy 2 then execute strategy 1
  executeStrategy1(player);
}

function executeStrategy2(currentAI) {
  logger.debug("Executing Strategy 2");
  logger.debug("currentAI " + currentAI.id);
  var rankValue = currentAI.hand.rankValue();
  logger.debug("AI hand rank value" + rankValue);
  if(rankValue>=8) { //If they have a Royal Flush, Straight Flush or Four of a Kind hold
    logger.debug("Hold for AI " + currentAI.id);
    handleHold(currentAI.id, currentAI.hand.id)
  } else if (rankValue===2 || rankValue===4) {
    tradeInNonMatchingCards(currentAI);
  } else if (rankValue===3) {
    tradeInTwoPairNonMatchingCard(currentAI);
  } else {
    tradeAllCards(currentAI);
  }

  if(testingMode&&!currentAI.hand.holding)
    currentAI.hand.waitingForSelenium = true;

  // Set who plays next
  callNextTurn();

	playTurn();
}

function executeStrategy1(currentAI) {
  logger.debug("Executing Strategy 1");
  logger.debug("currentAI " + currentAI.id);
  var rankValue = currentAI.hand.rankValue();
  logger.debug("AI hand rank value" + rankValue);
  if(rankValue>=5) {
    logger.debug("Hold for AI " + currentAI.id);
    handleHold(currentAI.id, currentAI.hand.id)
  } else if (rankValue>1) {
    if(rankValue===2 || rankValue===4) {
      tradeInNonMatchingCards(currentAI);
    } else {
      tradeInTwoPairNonMatchingCard(currentAI);
    }
  } else {
    tradeAllCards(currentAI);
  }

  if(testingMode&&!currentAI.hand.holding)
    currentAI.hand.waitingForSelenium = true;

  // Set who plays next
  callNextTurn();

	playTurn();
}

function tradeInNonMatchingCards(currentAI) {
  if(testingMode) {
    logger.debug("testing mode skipping card trade in");
  } else {

    var rankValue = currentAI.hand.rankValue();
    //trade in non triple/pair cards
    var r = currentAI.hand.getMatchingCardRank();
    for(var i=currentAI.hand.faceDown.length-1; i>=0; i--) {
      logger.debug(currentAI.hand.faceDown[i]);
      //check if the rank matches the double/triple
      if(currentAI.hand.faceDown[i].rank !== r) {
        logger.debug("cards rank: "+currentAI.hand.faceDown[i].rank+ "  pairs rank: "+r)
        //drop non-matching cards
        logger.debug("dropped a card"+i);
        currentAI.hand.faceDown.splice(i,1);
      }
    }

    //replace dropped cards
    var numberOfCardsDropped;
    if(rankValue === 4) {
      numberOfCardsDropped=2;
    } else {
      numberOfCardsDropped=3;
    }
    for(var i=0; i<numberOfCardsDropped; i++) {
      logger.debug("Added a card");
      currentAI.hand.addCard(FACEUP, deck.getCard());
    }
    currentAI.hand.showing.sort(function(a,b) {return a.value()-b.value()});

    logger.debug("Discard some cards for AI " + currentAI.id + " keep all the " + r);
    currentAI.hand.exchanged = true;
    socket.sockets.emit("exchange", {
        "handID": currentHandTurn,
        "player": currentAI
    });
  }
}

function tradeInTwoPairNonMatchingCard(currentAI) {
  if(testingMode) {
    logger.debug("testing mode skipping card trade in");
  } else {

    //Drop the card that is not part of the two pair
    cardToDrop = currentAI.hand.getTwoPairNonMatchingCardRank();
    logger.debug("the card to drop is: "+cardToDrop);
    for(var i=0; i<currentAI.hand.faceDown.length; i++) {
      logger.debug(currentAI.hand.faceDown[i].rank);
      //check if the rank matches the double/triple
      if(currentAI.hand.faceDown[i].rank === cardToDrop) {
        //drop matching card
        logger.debug("dropped a card"+i);
        currentAI.hand.faceDown.splice(i,1);
      }
    }
    //replace dropped card
    currentAI.hand.addCard(FACEUP, deck.getCard());
    logger.debug("Discard one card for AI " + currentAI.id + " keep two pair");
    currentAI.hand.exchanged = true;
    socket.sockets.emit("exchange", {
        "handID": currentHandTurn,
        "player": currentAI
    });
  }
}

function tradeAllCards(currentAI) {
  if(testingMode) {
    logger.debug("testing mode skipping card trade in");
  } else {

    logger.debug("number of cards to drop "+currentAI.hand.faceDown.length);
    //drop all cards
    for(var i=currentAI.hand.faceDown.length-1; i>=0; i--) {
      logger.debug("dropped a card"+i);
      currentAI.hand.faceDown.splice(i,1);
    }

    //replace dropped cards
    for(var i=0; i<5; i++) {
      logger.debug("Added a card");
      currentAI.hand.addCard(FACEUP, deck.getCard());
    }
    currentAI.hand.showing.sort(function(a,b) {return a.value()-b.value()});

    logger.debug("Discard all cards for AI " + currentAI.id);

    currentAI.hand.exchanged = true;

    socket.sockets.emit("exchange", {
        "handID": currentHandTurn,
        "player": currentAI
    });
  }
}

// Check if the game is over, if not, play the next turn
function callNextTurn() {

	if (!gameStarted)
		return;

	logger.debug("callNextTurn()");

  var humansTurn = true;
  var gameDone = true;
  for (var c in clients) {
    if (!clients[c].player.hand.waitingForAI) {
      logger.debug("Found an AI"+clients[c].player.id)
      if(!(clients[c].player.hand.holding||clients[c].player.hand.exchanged||clients[c].player.hand.waitingForSelenium)) {
        logger.debug("The AI has not played yet");
        currentTurn = clients[c].player.id;
        humansTurn = false;
        gameDone = false;
        break;
      }
      if(clients[c].player.hand.waitingForSelenium) {
        logger.debug("The AI is waiting for selenium");
        currentTurn = -1;
        humansTurn = false;
        gameDone = false;
        break;
      }
    }
  }
  if(humansTurn) {
    for (var c in clients) {
      if (clients[c].player.hand.waitingForAI) {
        logger.debug("Found a human"+clients[c].player.id)
        if(!(clients[c].player.hand.holding||clients[c].player.hand.exchanged)) {
          logger.debug("The human has not played yet");
          currentTurn = clients[c].player.id;
          gameDone = false;
          break;
        }
      }
    }
  }

  logger.debug("nextTurn: "+currentTurn);
  if(gameDone) {
    gameOver();
    resetGame();
  }

}

// To be called when all players have had their turn.
//
function determineTopPlayer() {

  var highestHandRank = 0;
  var highestCardRank = 0;
  var highestSuitRank = 0;
	var currentWinner = {}; // The player object
	var currentWinningHandId = 0; // Hand index of the winning player

	// Find the best hand
	for (var c in clients) {
		var player = clients[c].player;
    //logger.debug("checking if player " + player.id + " won");
    var playerHandRank = player.hand.rankValue();
    //logger.debug("player " +player.id+ "has a hand rank of " + playerHandRank);
    if(playerHandRank > highestHandRank) {
      //logger.debug("setting a currentwinner "+player.id);
      currentWinner = player;
      highestHandRank = playerHandRank;
      highestCardRank = player.hand.highestCardsRankValue();
      highestSuitRank = player.hand.highestCardsSuitValue()
    } else if (playerHandRank === highestHandRank) {
      var playerCardRank = player.hand.highestCardsRankValue();
      if(playerCardRank > highestCardRank) {
        //logger.debug("setting a currentwinner "+player.id);
        currentWinner = player;
        highestHandRank = playerHandRank;
        highestCardRank = playerCardRank;
        highestSuitRank = player.hand.highestCardsSuitValue()
      } else if (playerCardRank === highestCardRank) {
        var playerSuitRank = player.hand.highestCardsSuitValue();
        if(playerSuitRank > highestSuitRank) {
          //logger.debug("the highest player is "+player.id);
          currentWinner = player;
          highestHandRank = playerHandRank;
          highestCardRank = playerCardRank;
          highestSuitRank = playerSuitRank;
        }
      }
    }
	}

  logger.debug("returning winner "+currentWinner.name);
  return currentWinner;
}

// Return whether or not the game is in an end state.
function gameOver() {
  logger.debug("checking if the game is over");
	var numPlayersIn = clientCount;

	for (var c in clients) {
    logger.debug("c is "+c);
		var player = clients[c].player;

		// Check if this player has finished their turn
    if (player.hand.holding || player.hand.exchanged) {
			numPlayersIn--;
		}
	}

  logger.debug("there are "+numPlayersIn+" remaining to play");
	if (numPlayersIn === 0) {
    showAllHands();
    determinePlayerRanking();
    announceResults();
		return true;
	}

	return false;
}

function showAllHands() {
  for (var c in clients) {
    var player = clients[c].player;
    player.hand.makeAllVisible();
    socket.sockets.emit("showPlayer", player)
  }
}

function determinePlayerRanking() {
  var playerRanking = [] //map of player rankings from number 1 (best) to lowest
  for(var playerRank = 1; playerRank <= clientCount; playerRank++) {
    topPlayer = determineTopPlayer();
    playerRanking[topPlayer.id] = {"rank": playerRank, "name": topPlayer.name};
    delete clients[topPlayer.id];
  }
  for(var id in playerRanking) {
    logger.debug("Player "+playerRanking[id].name+" is ranked "+playerRanking[id].rank);
    socket.sockets.emit("notifyGameRanking", {
      "playerName": playerRanking[id].name,
      "playerRank": playerRanking[id].rank
    });
  }
}

// Emit the gameOver event for the give player rankings
function announceResults() {
  socket.sockets.emit("gameOver");
}
