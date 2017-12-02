"use strict";

/*
 * This module will have knowledge of the UI and implement the update
 * functions for the view
 *
 */

// Constants
 var LOG_LEVEL_NOTIFY = "black";
 var LOG_LEVEL_WARN = "#FF6600";

// Return the symbol for the given suit
//
function getSuitSymbol(suit) {
	switch (suit) {
		case "diams":
			return "♦";
		case "hearts":
			return "♥"
		case "clubs":
			return "♣";
		case "spades":
			return "♠";
		default:
			return "";
	}
}

// Return the current string being displayed to the user
//
function getCurrentNotification() {
	return $("#notifications").html();
}

// Remove and hide any notifications that are currently being displayed
//
function clearNotifications() {
	var notifications = $("#notifications");

	notifications.slideUp(650, function() {
		notifications.empty();
	});
}

// Update the notifications area to display the given message for the provided
// number of seconds
//
// A seconds value of null will remain until the next message
//
function displayMessage(message, seconds) {

	var notifications = $("#notifications")
	notifications.html(message);
	notifications.slideDown();

	if (!seconds)
		return;

	setTimeout(function() {
		// If a message has overwrote this one, let that one clean up
		if (notifications.html() !== message) {
			return;
		}

		// Hide the notification
		clearNotifications();
	}, seconds * 1000);
}

// Return the "log level" of the current notification.
// valid return values:
//     notify
//     warn
//     "" (empty string)
//
function logLevel() {
	switch ($("#notifications").css("color")) {
		case LOG_LEVEL_NOTIFY:
			return "notify";
		case LOG_LEVEL_WARN:
			return "warn";
	}
	return "";
}

// Notify the user of the provided message
//
function notify(message, seconds) {

	$("#notifications").css("color", LOG_LEVEL_NOTIFY);

	displayMessage(message, seconds);
}

// Notify the user of the provided warning
//
function warn(message, seconds) {

	$("#notifications").css("color", LOG_LEVEL_WARN); // Orange

	displayMessage(message, seconds);
}

// Return an HTML string representing the provided card object using the
// cards.css classes
//
function htmlCard(card, playerID) {
	var rank = card.rank.toUpperCase();
	var symbol = getSuitSymbol(card.suit);

  var localPlayerID = -1;
  if(localPlayer != null) {
    localPlayerID = localPlayer.id;
  }
  console.log("localPlayer.name: "+ playerID + localPlayerID);
	// Draw the card face up if both rank and suit are defined
	if (!card.hidden || playerID === localPlayerID) {
		return "<div class='card rank-" + card.rank + " " + card.suit + "'>"
			+      "<span class='rank'>" + rank + "</span>"
			+      "<span class='suit'>" + symbol + "</span>"
			+  "</div>";
	}

	// Otherwise, the card is drawn face down
	return "<div class='card back'></div>";
}

// Remove the player from the table
//
  function removePlayerFromTable(playerID) {
	$("#table #player-" + playerID).empty();
}

// Remove the cards from the table
//
  function removeCardsFromTable(playerID) {
	$("#table #player-" + playerID + " #cards").empty();
}

// Empty out the table area of the view
//
function clearTable() {
	$("#table").empty();
}

// Update the UI to display the current hand's turn
//
function displayTurnIndicator(playerID, handID) {

	// Clear the current turn class
	$(".turn").removeClass("turn");

	// Add the new turn class
  $("#player-" + playerID + " #hand-" + handID).addClass("turn");

  // Make the cards selectable
  $("#player-" + playerID + " #hand-" + handID).attr('id', 'selectable');
  $('#selectable').selectable();

}

// Upate the UI to display the hand as holding
//
function displayHeldHand(playerID, handID) {
	$("#player-" + playerID + " #hand-" + handID).addClass("hold");
}

// Set the counter in the game menu that displays number of remaining openings
//
function updateSlotCount(count) {
	$("#slot-count").html(count);
}

// Deduct one from the current slot cound value
//
function deductSlotCount() {
	var value = parseInt($("#slot-count").html());
	if (!isNaN(value)) {
		updateSlotCount(value - 1);
	}
}

// Add one to the current slot cound value
//
function incrementSlotCount() {
	var value = parseInt($("#slot-count").html());
	if (!isNaN(value)) {
		updateSlotCount(value + 1);
	}
}

// Draw the hands for this player, replacing the current cards.
// If the player is new to the game, give them a spot on the table
function drawHands(player) {

	var id = player.id;

	// Empty out the player area first
	$("#player-" + id + " .cards").html("");

  // Show face down cards
  player.hand.faceDown.forEach(function(card) {
    addToHand(player.id, player.name, player.hand.id, card);
  });

	// Show all face up cards
	player.hand.showing.forEach(function(card) {
		addToHand(player.id, player.name, player.hand.id, card);
	});
}

function enableControls(handID) {
	$("#exchange-btn").attr("disabled", false);
	$("#hold-btn").attr("disabled", false);

	$("#exchange-btn").click(function() {
    var cards = $("#selectable").children();
    var selectedCards = [];
    //console.log("Is it defined:"+cards.length);
    for(var i=0; i<cards.length; i++) {
      //console.log(cards[i]);
      if($( cards[i] ).hasClass("ui-selected")) {
        selectedCards.push($( cards[i] ).attr('class'));
        //console.log("The card was selected");
      }
    }
    /*
    cards.forEach(function (card) {
      if(card.hasClass("ui-selected")) {
        console.log("The card was selected");
      }
    });
    */
		exchange(handID, selectedCards);
	});
	$("#hold-btn").click(function() {
		hold(handID);
	});

	$("#controls").show();
}

// Append the given card to the player's area of the table
//
function addToHand(playerID, playerName, handID, card) {

	var playerTableArea = "#player-" + playerID;
	var handTableArea = "#hand-" + handID;
	var cardArea = playerTableArea + " " + handTableArea;

	// Create the player's table section if not present
	if (! $(playerTableArea).length) {
		var playerArea = "<div id='player-" + playerID + "'>"
				       +     "<span class='player-label'>" + playerName + ": </span>"
				       +     "<div class='cards'></div>"
				       + "</div>";
		$("#table").append(playerArea);
	}

	// Create this hand's area if not already present
	if (! $(cardArea).length) {
		var handArea = "<div class='hand' id='hand-" + handID + "'></div>";
		$(playerTableArea + " .cards").append(handArea);
	}

	$(cardArea).append(htmlCard(card));
}

function disableControls() {
	$("#controls").hide();

	$("#exchange-btn").attr("disabled", true);
	$("#hold-btn").attr("disabled", true);

	$("#exchange-btn").unbind("click");
	$("#hold-btn").unbind("click");
	$("#split-btn").unbind("click");
}

// Display the button to join a new game
//
function displayGameMenu() {

	$("#game-options").show();
	$("#play-again").show();
	$("#add-ai").show();

	$("#play-again").removeClass("disabled");
	$("#add-ai").removeClass("disabled");
	$("#play-again").prop("disabled", false);
	$("#add-ai").prop("disabled", false);

	$("#game-options button").unbind("click");

	$("#play-again").click(function() {
		joinGame();
		$("#play-again").hide();
	});
	$("#add-ai").click(function() {
		requestNewPlayer();
	});
}

// Hide the controls to add AI players to the game
//
function displayGameFull() {
	notify("Game is now full", null);
	$("#add-ai").prop("disabled", true);
	$("#play-again").prop("disabled", true);
	$("#add-ai").addClass("disabled");
	$("#play-again").addClass("disabled");
}

// Hide all menus
//
function hideMenus() {
	disableControls();
	$("#game-options").hide();
}
