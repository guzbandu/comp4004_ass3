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

public class StrategyTest1 {
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser() {
		System.setProperty(Utils.GECKO_PROPERTY, Utils.GECKO_DRIVER);
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	}
	
	@Test
	public void aiStrategy2play2() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);
				
		//Add an AI player with nothing in their hand
		Card card11 = new Card("rank-3", "hearts");
		Card card12 = new Card("rank-5", "spades");
		Card card13 = new Card("rank-7", "clubs");
		Card card14 = new Card("rank-2", "hearts");
		Card card15 = new Card("rank-8", "clubs");
		Hand ai1Hand = new Hand();
		ai1Hand.addCard(card11);
		ai1Hand.addCard(card12);
		ai1Hand.addCard(card13);
		ai1Hand.addCard(card14);
		ai1Hand.addCard(card15);
		Utils.addAI(driver, ai1Hand);
		
		//Add an AI player with nothing in their hand
		Card card21 = new Card("rank-2", "diams");
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
		
		//Add an AI player with a flush in their hand
		Card card31 = new Card("rank-6", "hearts");
		Card card32 = new Card("rank-8", "hearts");
		Card card33 = new Card("rank-a", "hearts");
		Card card34 = new Card("rank-9", "hearts");
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
		Card card16 = new Card("rank-3", "spades");
		Card card17 = new Card("rank-3", "diams");
		Card card18 = new Card("rank-9", "diams");
		Card card19 = new Card("rank-9", "clubs");
		Card card110 = new Card("rank-9", "spades");
		Hand ai1NewHand = new Hand();
		ai1NewHand.addCard(card16);
		ai1NewHand.addCard(card17);
		ai1NewHand.addCard(card18);
		ai1NewHand.addCard(card19);
		ai1NewHand.addCard(card110);
		Hand ai1OldHand = new Hand();
		ai1OldHand.addCard(card11);
		ai1OldHand.addCard(card12);
		ai1OldHand.addCard(card13);
		ai1OldHand.addCard(card14);
		ai1OldHand.addCard(card15);
		Utils.exchangeCardsAI(driver, 1, ai1NewHand, ai1OldHand);
		
		Hand ai1FinalHand = new Hand();
		ai1FinalHand.addCard(card16);
		ai1FinalHand.addCard(card17);
		ai1FinalHand.addCard(card18);
		ai1FinalHand.addCard(card19);
		ai1FinalHand.addCard(card110);

		// Submit a "rigged" exchange for AI2 
		Card card26 = new Card("rank-10", "spades");
		Card card27 = new Card("rank-j", "spades");
		Card card28 = new Card("rank-q", "spades");
		Card card29 = new Card("rank-k", "spades");
		Card card210 = new Card("rank-a", "spades");
		Hand ai2NewHand = new Hand();
		ai2NewHand.addCard(card26);
		ai2NewHand.addCard(card27);
		ai2NewHand.addCard(card28);
		ai2NewHand.addCard(card29);
		ai2NewHand.addCard(card210);
		Hand ai2OldHand = new Hand();
		ai2OldHand.addCard(card21);
		ai2OldHand.addCard(card22);
		ai2OldHand.addCard(card23);
		ai2OldHand.addCard(card24);
		ai2OldHand.addCard(card25);
		Utils.exchangeCardsAI(driver, 2, ai2NewHand, ai2OldHand);
		
		Hand ai2FinalHand = new Hand();
		ai2FinalHand.addCard(card26);
		ai2FinalHand.addCard(card27);
		ai2FinalHand.addCard(card28);
		ai2FinalHand.addCard(card29);
		ai2FinalHand.addCard(card210);
		
		// Normally AI3 would hold but strategy 2 kicks in and AI3 will exchange instead
		// Submit a "rigged" exchange for AI3
		Card card36 = new Card("rank-4", "clubs");
		Card card37 = new Card("rank-4", "hearts");
		Card card38 = new Card("rank-5", "clubs");
		Card card39 = new Card("rank-a", "clubs");
		Card card310 = new Card("rank-7", "hearts");
		Hand ai3NewHand = new Hand();
		ai3NewHand.addCard(card36);
		ai3NewHand.addCard(card37);
		ai3NewHand.addCard(card38);
		ai3NewHand.addCard(card39);
		ai3NewHand.addCard(card310);
		Hand ai3OldHand = new Hand();
		ai3OldHand.addCard(card31);
		ai3OldHand.addCard(card32);
		ai3OldHand.addCard(card33);
		ai3OldHand.addCard(card34);
		ai3OldHand.addCard(card35);
		Utils.exchangeCardsAI(driver, 3, ai3NewHand, ai3OldHand);
		
		Hand ai3FinalHand = new Hand();
		ai3FinalHand.addCard(card36);
		ai3FinalHand.addCard(card37);
		ai3FinalHand.addCard(card38);
		ai3FinalHand.addCard(card39);
		ai3FinalHand.addCard(card310);
		
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
		results.put("Agent 1", "ranked 3");
		results.put("Agent 2", "ranked 1");
		results.put("Agent 3", "ranked 4");
		results.put("Player 4", "ranked 2");
		Assert.assertEquals(true, Utils.expectedWinnersMatch(driver, results));
	}

	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}
}
