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
    gameWinner = {};

//Constants
var FACEDOWN = false;
var FACEUP = true;
var MIN_PLAYERS = 2;
var AIs = []; // Map of AI object to playerIDs
var AI_TURN_TIME = 3500; // Milliseconds for AI's to play

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

//Start the servers
http.listen(port, function(){
  logger.debug('listening on port:'+port);
});
socket = io.listen(8889);
socket.set("transports", "websocket");

//Wait for the intial client connection
socket.sockets.on('connection', function(client){
  client.on("exchange", handleExchange);
  client.on("hold", handleHold);
  client.on("addAI", function() {
    addAI(client)
  });
  client.on("joinGame", function() {
		handleJoinGame(client)
	});
});

//Initialize the game state
resetGame();

function handleExchange(handID, cards) {
  logger.debug("handle exchange called: "+handID);
  var client = clients[this.id];
	if (!client)
		return false;

	// Verify request is not spoofed
	if (!requestByCurrentTurn(client.player, handID))
		return;

  for(var i=0; i<cards.length; i++) {
    logger.debug("card");
    //console.log("player exists"+client.player.hand.showing);
    startNum = client.player.hand.faceDown.length-1;
    for(var j=startNum; j>=0; j--) {
      logger.debug(client.player.hand.faceDown[j].rank+client.player.hand.faceDown[j].suit+cards[i]);
      //check if the rank and suit match
      if(cards[i].indexOf("-"+client.player.hand.faceDown[j].rank) !== -1 && cards[i].indexOf(client.player.hand.faceDown[j].suit) !== -1) {
        logger.debug("dropped a card"+j);
        client.player.hand.faceDown.splice(j,1);
      }
    }
  }

  for(var i=0; i<cards.length; i++) {
    logger.debug("Added a card");
    client.player.hand.addCard(FACEUP, deck.getCard());
  }

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

// Client requested a hold for the game
//
function handleHold(handID) {

	var client = clients[handID];
	if (!client) {
		return false;
    logger.debug("In hold could not find client"+handID)
  }

	// Verify request is not spoofed
	if (!requestByCurrentTurn(client.player, handID))
		return;

	client.player.hand.holding = true;

	socket.sockets.emit("hold", {
		"playerID": currentTurn,
		"handID": currentHandTurn,
		"playerName": client.player.name
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
  //TODO fix hands for testing go back to random later
  //newPlayer.hand.addCard(FACEUP, new Card("6", "hearts", FACEUP));
  //newPlayer.hand.addCard(FACEUP, new Card("2", "hearts", FACEUP));
  //newPlayer.hand.addCard(FACEUP, new Card("6", "spades", FACEUP));
  //newPlayer.hand.addCard(FACEUP, new Card("2", "diams", FACEUP));
  //newPlayer.hand.addCard(FACEUP, new Card("2", "clubs", FACEUP));

  newPlayer.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  newPlayer.hand.showing.sort(function(a,b) {return a.value()-b.value()});

  //TODO testing - check the rank of the hand dealt
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
	clients[client.id] = {
		"player": newPlayer,
		"playTurn": playerTurn,
		"connection": client
	};
}

// Send he provided event with the player to the provided client with the face
// down cards filtered out
function filterSendPlayer(event, client, player) {
	//player = filterFaceDownPlayer(player);
	client.emit(event, player);
}

//The player makes all the decisions
function playerTurn() {
}

function dealHand(player, visible) {
  for(i=0; i<5; i++)
    player.hand.addCard(visible, deck.getCard());
}

// Reset all game attributes to allow new joins
function resetGame() {
	deck = new Deck();
	gameStarted = false;
	countDownStarted = false;
	clients = []; // map of client UIDs to Player and network handle objects
	clientCount = 0;
  availableIDs = [4, 3, 2, 1];
	currentTurn = -1;
	currentHandTurn = 0;
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

	socket.sockets.emit("countDown", countDownSeconds);

	setTimeout(runGame, countDownSeconds * 1000);
}

function playTurn() {

	logger.debug("playTurn(): player " + currentTurn + " hand " + currentHandTurn);

	var client = getClientByID(currentTurn);

	if (!client)
		return;

	// Notify players of the current turn
	socket.sockets.emit("turn", {
		"playerID": currentTurn,
		"handID": currentHandTurn
	});

  // Set who plays next
  callNextTurn();

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
function addAI(client) {

	if (!availableIDs.length) {
		// No more room
		return;
	}

	logger.info("Adding AI");

	clientCount++;
	var playerID = availableIDs.pop();
  var newHand = new Hand(0);
	var ai = new Player(playerID, 0, "Agent " + playerID, newHand);

	// Give hand to new player
	//dealHand(ai, FACEDOWN);
  ai.hand.addCard(FACEDOWN, new Card("8", "hearts", FACEDOWN));
  ai.hand.addCard(FACEDOWN, new Card("2", "hearts", FACEDOWN));
  ai.hand.addCard(FACEDOWN, new Card("2", "spades", FACEDOWN));
  ai.hand.addCard(FACEDOWN, new Card("8", "diams", FACEDOWN));
  ai.hand.addCard(FACEDOWN, new Card("4", "clubs", FACEDOWN));
  ai.hand.faceDown.sort(function(a,b) {return a.value()-b.value()});
  ai.hand.showing.sort(function(a,b) {return a.value()-b.value()});

	// Notify existing clients of new player arrival
	broadcastPlayer("newPlayer", null, ai)

	var aiClient = {
		"id": "AI" + playerID
	};

	// Map this player ID to the AI object
	AIs[playerID] = aiClient;

	// Map the new player and connection handle to this client uid
	clients[aiClient.id] = {
		"player": ai,
		"playTurn": function() {
			setTimeout(AITurn, AI_TURN_TIME);
		},
		"connection": null
	};

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
    logger.debug("registering new AI");
    logger.debug("event"+event);
    logger.debug("player"+player.id);
		socket.sockets.emit(event, player);
  }
}

// Verify that the current request was made by the player who's turn it is
// and that the handID matches the current turn hand.
function requestByCurrentTurn(player, handID) {
	return player.id === currentTurn && handID === currentHandTurn;
}

// The current turn belongs to an AI player. Handle their
// move and increment the turn
function AITurn() {

	logger.debug("AIs turn");

  var client = getClientByID(currentTurn);
	if (!client) {
		logger.info("Something went wrong. AI player not found!");
		return;
	}

	var player = client.player;

	var thisAi = AIs[player.id];
	if (!thisAi) {
		logger.info("Failed to retrieve this ai for player " + player.id);
		return;
	}

  //TODO if there are other AI's who haved moved and are visible implement option2 logic here

  executeStrategy1(player);
}

function executeStrategy1(currentAI) {
  logger.debug("currentAI " + currentAI);
  logger.debug("currentAI.hand " + currentAI.hand);
  var rankValue = currentAI.hand.rankValue();
  logger.debug("AI hand rank value" + rankValue);
  if(rankValue>=5) {
    logger.debug("Hold for AI " + currentAI.id);
    handleHold(currentAI.hand.id)
  } else if (rankValue>1) {
    if(rankValue===2 || rankValue===4) {
      //trade in non triple/pair cards
      var r = currentAI.hand.getMatchingCardRank();
      for(var i=4; i>=0; i--) {
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
  } else {
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
  // Set who plays next
  callNextTurn();

	playTurn();
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
      if(!(clients[c].player.hand.hold||clients[c].player.hand.exchanged)) {
        logger.debug("The AI has not played yet");
        currentTurn = clients[c].player.id;
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
        if(!(clients[c].player.hand.hold||clients[c].player.hand.exchanged)) {
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

/*
// Assign the turn to the next player
function incrementTurn() {

	logger.debug("incrementTurn()");

	var client = getClientByID(currentTurn);
	if (!client)
		return;

	// If this hand does not need to be played move on to the next player
	if (client.player.hand.holding || client.player.hand.exchanged) {
		currentHandTurn = 0;
		currentTurn++;
		if (currentTurn > clientCount) {// Mod
      currentTurn = 0 //Start at the beginning again, let human players play after the UI has played
      //gameOver();
      //resetGame();
    }
	}
}
*/

// Emit the gameOver event for the provided winner player ID
// along with the provided description of the win case
//
function announceWinner(winner, details) {
  for (var c in clients) {
    var player = clients[c].player;
    player.hand.makeAllVisible();
    socket.sockets.emit("showPlayer", player)
  }
  socket.sockets.emit("gameOver", {
    "winnerID": winner.id,
    "details": details
  });
}

// To be called when all players have had their turn.
//
function determineWinner() {

  var highestHandRank = 0;
  var highestCardRank = 0;
  var highestSuitRank = 0;
	var currentWinner = {}; // The player object
	var currentWinningHandId = 0; // Hand index of the winning player

	// Find the best hand
	for (var c in clients) {
		var player = clients[c].player;
    logger.debug("checking if player " + player.id + " won");
    var playerHandRank = player.hand.rankValue();
    logger.debug("player " +player.id+ "has a hand rank of " + playerHandRank);
    if(playerHandRank > highestHandRank) {
      logger.debug("setting a currentwinner "+player.id);
      currentWinner = player;
      highestHandRank = playerHandRank;
      highestCardRank = player.hand.highestCardsRankValue();
      highestSuitRank = player.hand.highestCardsSuitValue()
    } else if (playerHandRank === highestHandRank) {
      var playerCardRank = player.hand.highestCardsRankValue();
      if(playerCardRank > highestCardRank) {
        logger.debug("setting a currentwinner "+player.id);
        currentWinner = player;
        highestHandRank = playerHandRank;
        highestCardRank = playerCardRank;
        highestSuitRank = player.hand.highestCardsSuitValue()
      } else if (playerCardRank === highestCardRank) {
        var playerSuitRank = player.hand.highestCardsSuitValue();
        if(playerSuitRank > highestSuitRank) {
          logger.debug("setting a currentwinner "+player.id);
          currentWinner = player;
          highestHandRank = playerHandRank;
          highestCardRank = playerCardRank;
          highestSuitRank = playerSuitRank;
        }
      }
    }
	}

  logger.debug("currentwinner"+currentWinner.hand.id)
	announceWinner(currentWinner, "Best Hand with a " + currentWinner.hand.rank());
}

// Return whether or not the game is in an end state.
function gameOver() {
  logger.debug("checking if the game is over");
	var numPlayersIn = clientCount;

	for (var c in clients) {
		var player = clients[c].player;

		// Check if this player has finished their turn
    if (player.hand.holding || player.hand.exchanged) {
			numPlayersIn--;
		}
	}

  logger.debug("there are "+numPlayersIn+" remaining to play");
	if (numPlayersIn === 0) {
		determineWinner();
		return true;
	}

	return false;
}
