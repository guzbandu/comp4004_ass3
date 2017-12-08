package selenium;

import java.util.Hashtable;
import java.util.concurrent.TimeUnit;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class StrategyTest4 {
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser() {
		System.setProperty(Utils.GECKO_PROPERTY, Utils.GECKO_DRIVER);
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	}

	@Test
	public void aiStrategy2play1() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);
				
		//Add an AI player with a pair in their hand
		Card card11 = new Card("rank-q", "hearts");
		Card card12 = new Card("rank-q", "spades");
		Card card13 = new Card("rank-10", "clubs");
		Card card14 = new Card("rank-2", "hearts");
		Card card15 = new Card("rank-8", "clubs");
		Hand ai1Hand = new Hand();
		ai1Hand.addCard(card11);
		ai1Hand.addCard(card12);
		ai1Hand.addCard(card13);
		ai1Hand.addCard(card14);
		ai1Hand.addCard(card15);
		Utils.addAI(driver, ai1Hand);
		
		//Add an AI player with a pair
		Card card21 = new Card("rank-3", "diams");
		Card card22 = new Card("rank-3", "clubs");
		Card card23 = new Card("rank-7", "spades");
		Card card24 = new Card("rank-8", "diams");
		Card card25 = new Card("rank-5", "diams");
		Hand ai2Hand = new Hand();
		ai2Hand.addCard(card21);
		ai2Hand.addCard(card22);
		ai2Hand.addCard(card23);
		ai2Hand.addCard(card24);
		ai2Hand.addCard(card25);
		Utils.addAI(driver, ai2Hand);
		
		//Add an AI player with two pair in their hand
		Card card31 = new Card("rank-6", "clubs");
		Card card32 = new Card("rank-6", "spades");
		Card card33 = new Card("rank-a", "hearts");
		Card card34 = new Card("rank-a", "spades");
		Card card35 = new Card("rank-5", "hearts");
		Hand ai3Hand = new Hand();
		ai3Hand.addCard(card31);
		ai3Hand.addCard(card32);
		ai3Hand.addCard(card33);
		ai3Hand.addCard(card34);
		ai3Hand.addCard(card35);
		Utils.addAI(driver, ai3Hand);
		
		//Add a human player with a Royal Flush
		Card card41 = new Card("rank-q", "diams");
		Card card42 = new Card("rank-j", "diams");
		Card card43 = new Card("rank-10", "diams");
		Card card44 = new Card("rank-k", "diams");
		Card card45 = new Card("rank-a", "diams");
		Hand human4Hand = new Hand();
		human4Hand.addCard(card41);
		human4Hand.addCard(card42);
		human4Hand.addCard(card43);
		human4Hand.addCard(card44);
		human4Hand.addCard(card45);
		Utils.addHuman(driver, human4Hand);		
					
		// Give time for AIs to join, to start the game and have each AI play their turn
		Utils.pause(Utils.JOIN_TIME+Utils.START_GAME + 3*Utils.AI_TURN);
		
		// Submit a "rigged" exchange for AI1
		Card card16 = new Card("rank-3", "clubs");
		Card card17 = new Card("rank-4", "diams");
		Card card18 = new Card("rank-10", "hearts");
		Hand ai1NewHand = new Hand();
		ai1NewHand.addCard(card16);
		ai1NewHand.addCard(card17);
		ai1NewHand.addCard(card18);
		Hand ai1OldHand = new Hand();
		ai1OldHand.addCard(card13);
		ai1OldHand.addCard(card14);
		ai1OldHand.addCard(card15);
		Utils.exchangeCardsAI(driver, 1, ai1NewHand, ai1OldHand);
		
		Hand ai1FinalHand = new Hand();
		ai1FinalHand.addCard(card11);
		ai1FinalHand.addCard(card12);
		ai1FinalHand.addCard(card16);
		ai1FinalHand.addCard(card17);
		ai1FinalHand.addCard(card18);

		// Submit a "rigged" exchange for AI2 
		Card card26 = new Card("rank-j", "spades");
		Card card27 = new Card("rank-j", "clubs");
		Card card28 = new Card("rank-j", "hearts");
		Hand ai2NewHand = new Hand();
		ai2NewHand.addCard(card26);
		ai2NewHand.addCard(card27);
		ai2NewHand.addCard(card28);
		Hand ai2OldHand = new Hand();
		ai2OldHand.addCard(card23);
		ai2OldHand.addCard(card24);
		ai2OldHand.addCard(card25);
		Utils.exchangeCardsAI(driver, 2, ai2NewHand, ai2OldHand);
		
		Hand ai2FinalHand = new Hand();
		ai2FinalHand.addCard(card21);
		ai2FinalHand.addCard(card22);
		ai2FinalHand.addCard(card26);
		ai2FinalHand.addCard(card27);
		ai2FinalHand.addCard(card28);
		
		// Submit a "rigged" exchange for AI3
		Card card36 = new Card("rank-a", "clubs");
		Hand ai3NewHand = new Hand();
		ai3NewHand.addCard(card36);
		Hand ai3OldHand = new Hand();
		ai3OldHand.addCard(card35);
		Utils.exchangeCardsAI(driver, 3, ai3NewHand, ai3OldHand);
		
		Hand ai3FinalHand = new Hand();
		ai3FinalHand.addCard(card31);
		ai3FinalHand.addCard(card32);
		ai3FinalHand.addCard(card33);
		ai3FinalHand.addCard(card34);
		ai3FinalHand.addCard(card36);
		
		//Wait for AI exchanges to finish
		Utils.pause(Utils.AI_TURN);
		
		//Have the player hold
		driver.findElement(By.id("hold-btn")).click();
		
		//Check what their hands are after the game has been played
		//Both players should have held and their final hands should match their starting hands
		Hand ai1HandFinal = Utils.playerHand(driver, 1);
		Assert.assertEquals(true, Utils.areHandsEqual(ai1FinalHand, ai1HandFinal));
		Hand ai2HandFinal = Utils.playerHand(driver, 2);
		Assert.assertEquals(true, Utils.areHandsEqual(ai2FinalHand, ai2HandFinal));
		Hand ai3HandFinal = Utils.playerHand(driver, 3);
		Assert.assertEquals(true, Utils.areHandsEqual(ai3FinalHand, ai3HandFinal));
		Hand human4HandFinal = Utils.playerHand(driver, 4);
		Assert.assertEquals(true, Utils.areHandsEqual(human4Hand, human4HandFinal));
		//Confirm the end game results
		Hashtable<String, String> results = new Hashtable<String, String>();
		results.put("Agent 1", "ranked 4");
		results.put("Agent 2", "ranked 3");
		results.put("Agent 3", "ranked 2");
		results.put("Player 4", "ranked 1");
		Assert.assertEquals(true, Utils.expectedWinnersMatch(driver, results));
	}

	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}
}
