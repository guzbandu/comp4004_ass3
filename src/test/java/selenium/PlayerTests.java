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

public class PlayerTests {
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser() {
		System.setProperty("webdriver.gecko.driver", "bin/geckodriver");
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	} 

	//Confirm that the human player play's as expected
	//style="color: transparent; background-color: transparent; border-color: transparent; cursor: default; width: 1px;"
	@Test
	public void playerSequence1() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);

		//Add a human player with a straight flush in their hand
		Card card11 = new Card("rank-q", "diams");
		Card card12 = new Card("rank-j", "diams");
		Card card13 = new Card("rank-10", "diams");
		Card card14 = new Card("rank-9", "diams");
		Card card15 = new Card("rank-8", "diams");
		Hand human1Hand = new Hand();
		human1Hand.addCard(card11);
		human1Hand.addCard(card12);
		human1Hand.addCard(card13);
		human1Hand.addCard(card14);
		human1Hand.addCard(card15);
		Utils.addHuman(driver, human1Hand);

		//Add a human player with a flush in their hand
		Card card21 = new Card("rank-3", "clubs");
		Card card22 = new Card("rank-2", "clubs");
		Card card23 = new Card("rank-a", "clubs");
		Card card24 = new Card("rank-7", "clubs");
		Card card25 = new Card("rank-5", "clubs");
		Hand human2Hand = new Hand();
		human2Hand.addCard(card21);
		human2Hand.addCard(card22);
		human2Hand.addCard(card23);
		human2Hand.addCard(card24);
		human2Hand.addCard(card25);
		Utils.addHuman(driver, human2Hand);

		//Add a human player with a pair in their hand
		Card card31 = new Card("rank-2", "diams");
		Card card32 = new Card("rank-2", "spades");
		Card card33 = new Card("rank-8", "clubs");
		Card card34 = new Card("rank-7", "spades");
		Card card35 = new Card("rank-5", "hearts");
		Hand human3Hand = new Hand();
		human3Hand.addCard(card31);
		human3Hand.addCard(card32);
		human3Hand.addCard(card33);
		human3Hand.addCard(card34);
		human3Hand.addCard(card35);
		Utils.addHuman(driver, human3Hand);
		
		//Add a human player with a four of a kind in their hand
		Card card41 = new Card("rank-k", "clubs");
		Card card42 = new Card("rank-k", "diams");
		Card card43 = new Card("rank-k", "spades");
		Card card44 = new Card("rank-k", "hearts");
		Card card45 = new Card("rank-4", "clubs");
		Hand human4Hand = new Hand();
		human4Hand.addCard(card41);
		human4Hand.addCard(card42);
		human4Hand.addCard(card43);
		human4Hand.addCard(card44);
		human4Hand.addCard(card45);
		Utils.addHuman(driver, human4Hand);
		
		// Give time for players to join, to start the game
		Utils.pause(Utils.JOIN_TIME+Utils.START_GAME);
		
		// Have the first player hold
		driver.findElement(By.id("hold-btn")).click();	
		
		// Have the second player hold
		driver.findElement(By.id("hold-btn")).click();
		
		// Have the third player keep their pair and exchange the rest of their cards
		// Let's give them a full house
		Card card36 = new Card("rank-2", "hearts");
		Card card37 = new Card("rank-6", "spades");
		Card card38 = new Card("rank-6", "hearts");
		Hand human3ExchangeNew = new Hand();
		human3ExchangeNew.addCard(card36);
		human3ExchangeNew.addCard(card37);
		human3ExchangeNew.addCard(card38);
		Hand human3ExchangeOld = new Hand();
		human3ExchangeOld.addCard(card33);
		human3ExchangeOld.addCard(card34);
		human3ExchangeOld.addCard(card35);
		Utils.exchangeCards(driver, 3, human3ExchangeNew, human3ExchangeOld);
		
		Hand human3FinalHand = new Hand();
		human3FinalHand.addCard(card31);
		human3FinalHand.addCard(card32);
		human3FinalHand.addCard(card36);
		human3FinalHand.addCard(card37);
		human3FinalHand.addCard(card38);
		
		// Have the fourth player hold
		driver.findElement(By.id("hold-btn")).click();
		
		
		//Check that the final hands match the expected hands
		Hand human1HandFinal = Utils.playerHand(driver, 1);
		Assert.assertEquals(true, Utils.areHandsEqual(human1Hand, human1HandFinal));
		Hand human2HandFinal = Utils.playerHand(driver, 2);
		Assert.assertEquals(true, Utils.areHandsEqual(human2Hand, human2HandFinal));
		Hand human3HandFinal = Utils.playerHand(driver, 3);
		Assert.assertEquals(true, Utils.areHandsEqual(human3FinalHand, human3HandFinal));
		Hand human4HandFinal = Utils.playerHand(driver, 4);
		Assert.assertEquals(true, Utils.areHandsEqual(human4Hand, human4HandFinal));
		
		//Check the player rankings
		Hashtable<String, String> results = new Hashtable<String, String>();
		results.put("Player 1", "ranked 1");
		results.put("Player 2", "ranked 4");
		results.put("Player 3", "ranked 3");
		results.put("Player 4", "ranked 2");
		Assert.assertEquals(true, Utils.expectedWinnersMatch(driver, results));
	}
	
	@Test
	public void playerSequence2() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);

		//Add a human player with a Royal flush in their hand
		Card card11 = new Card("rank-q", "diams");
		Card card12 = new Card("rank-j", "diams");
		Card card13 = new Card("rank-10", "diams");
		Card card14 = new Card("rank-k", "diams");
		Card card15 = new Card("rank-a", "diams");
		Hand human1Hand = new Hand();
		human1Hand.addCard(card11);
		human1Hand.addCard(card12);
		human1Hand.addCard(card13);
		human1Hand.addCard(card14);
		human1Hand.addCard(card15);
		Utils.addHuman(driver, human1Hand);

		//Add a human player with a straight in their hand
		Card card21 = new Card("rank-3", "clubs");
		Card card22 = new Card("rank-2", "hearts");
		Card card23 = new Card("rank-a", "diams");
		Card card24 = new Card("rank-4", "clubs");
		Card card25 = new Card("rank-5", "spades");
		Hand human2Hand = new Hand();
		human2Hand.addCard(card21);
		human2Hand.addCard(card22);
		human2Hand.addCard(card23);
		human2Hand.addCard(card24);
		human2Hand.addCard(card25);
		Utils.addHuman(driver, human2Hand);

		//Add a human player with a pair in their hand
		Card card31 = new Card("rank-6", "diams");
		Card card32 = new Card("rank-6", "spades");
		Card card33 = new Card("rank-9", "clubs");
		Card card34 = new Card("rank-q", "spades");
		Card card35 = new Card("rank-5", "hearts");
		Hand human3Hand = new Hand();
		human3Hand.addCard(card31);
		human3Hand.addCard(card32);
		human3Hand.addCard(card33);
		human3Hand.addCard(card34);
		human3Hand.addCard(card35);
		Utils.addHuman(driver, human3Hand);
		
		//Add a human player with a three of a kind in their hand
		Card card41 = new Card("rank-k", "clubs");
		Card card42 = new Card("rank-k", "diams");
		Card card43 = new Card("rank-7", "spades");
		Card card44 = new Card("rank-k", "hearts");
		Card card45 = new Card("rank-4", "clubs");
		Hand human4Hand = new Hand();
		human4Hand.addCard(card41);
		human4Hand.addCard(card42);
		human4Hand.addCard(card43);
		human4Hand.addCard(card44);
		human4Hand.addCard(card45);
		Utils.addHuman(driver, human4Hand);
		
		// Give time for players to join, to start the game
		Utils.pause(Utils.JOIN_TIME+Utils.START_GAME);
		
		// Have the first player hold
		driver.findElement(By.id("hold-btn")).click();	
		
		// Have the second player hold
		driver.findElement(By.id("hold-btn")).click();
		
		// Have the third player keep their pair and exchange the rest of their cards
		// Let's give them a full house
		Card card36 = new Card("rank-2", "hearts");
		Card card37 = new Card("rank-a", "spades");
		Card card38 = new Card("rank-6", "hearts");
		Hand human3ExchangeNew = new Hand();
		human3ExchangeNew.addCard(card36);
		human3ExchangeNew.addCard(card37);
		human3ExchangeNew.addCard(card38);
		Hand human3ExchangeOld = new Hand();
		human3ExchangeOld.addCard(card33);
		human3ExchangeOld.addCard(card34);
		human3ExchangeOld.addCard(card35);
		Utils.exchangeCards(driver, 3, human3ExchangeNew, human3ExchangeOld);
		
		Hand human3FinalHand = new Hand();
		human3FinalHand.addCard(card31);
		human3FinalHand.addCard(card32);
		human3FinalHand.addCard(card36);
		human3FinalHand.addCard(card37);
		human3FinalHand.addCard(card38);
		
		// Have the fourth player hold
		driver.findElement(By.id("hold-btn")).click();
		
		
		//Check that the final hands match the expected hands
		Hand human1HandFinal = Utils.playerHand(driver, 1);
		Assert.assertEquals(true, Utils.areHandsEqual(human1Hand, human1HandFinal));
		Hand human2HandFinal = Utils.playerHand(driver, 2);
		Assert.assertEquals(true, Utils.areHandsEqual(human2Hand, human2HandFinal));
		Hand human3HandFinal = Utils.playerHand(driver, 3);
		Assert.assertEquals(true, Utils.areHandsEqual(human3FinalHand, human3HandFinal));
		Hand human4HandFinal = Utils.playerHand(driver, 4);
		Assert.assertEquals(true, Utils.areHandsEqual(human4Hand, human4HandFinal));
		
		//Check the player rankings
		Hashtable<String, String> results = new Hashtable<String, String>();
		results.put("Player 1", "ranked 1");
		results.put("Player 2", "ranked 2");
		results.put("Player 3", "ranked 4");
		results.put("Player 4", "ranked 3");
		Assert.assertEquals(true, Utils.expectedWinnersMatch(driver, results));
	}	
	
	@Test
	public void playerSequence3() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);

		//Add a human player with two pair in their hand
		Card card11 = new Card("rank-q", "diams");
		Card card12 = new Card("rank-q", "spades");
		Card card13 = new Card("rank-10", "diams");
		Card card14 = new Card("rank-10", "hearts");
		Card card15 = new Card("rank-j", "diams");
		Hand human1Hand = new Hand();
		human1Hand.addCard(card11);
		human1Hand.addCard(card12);
		human1Hand.addCard(card13);
		human1Hand.addCard(card14);
		human1Hand.addCard(card15);
		Utils.addHuman(driver, human1Hand);

		//Add a human player with three of a kind in their hand
		Card card21 = new Card("rank-3", "clubs");
		Card card22 = new Card("rank-3", "hearts");
		Card card23 = new Card("rank-3", "diams");
		Card card24 = new Card("rank-j", "clubs");
		Card card25 = new Card("rank-5", "spades");
		Hand human2Hand = new Hand();
		human2Hand.addCard(card21);
		human2Hand.addCard(card22);
		human2Hand.addCard(card23);
		human2Hand.addCard(card24);
		human2Hand.addCard(card25);
		Utils.addHuman(driver, human2Hand);

		//Add a human player with a pair in their hand
		Card card31 = new Card("rank-6", "diams");
		Card card32 = new Card("rank-6", "spades");
		Card card33 = new Card("rank-9", "clubs");
		Card card34 = new Card("rank-q", "hearts");
		Card card35 = new Card("rank-5", "hearts");
		Hand human3Hand = new Hand();
		human3Hand.addCard(card31);
		human3Hand.addCard(card32);
		human3Hand.addCard(card33);
		human3Hand.addCard(card34);
		human3Hand.addCard(card35);
		Utils.addHuman(driver, human3Hand);
		
		//Add a human player with flush in their hand
		Card card41 = new Card("rank-k", "clubs");
		Card card42 = new Card("rank-10", "clubs");
		Card card43 = new Card("rank-7", "clubs");
		Card card44 = new Card("rank-k", "clubs");
		Card card45 = new Card("rank-4", "clubs");
		Hand human4Hand = new Hand();
		human4Hand.addCard(card41);
		human4Hand.addCard(card42);
		human4Hand.addCard(card43);
		human4Hand.addCard(card44);
		human4Hand.addCard(card45);
		Utils.addHuman(driver, human4Hand);
		
		// Give time for players to join, to start the game
		Utils.pause(Utils.JOIN_TIME+Utils.START_GAME);
		
		// Have the first player hold
		Card card16 = new Card("rank-5", "diams");
		Hand human1ExchangeNew = new Hand();
		human1ExchangeNew.addCard(card16);
		Hand human1ExchangeOld = new Hand();
		human1ExchangeOld.addCard(card15);
		Utils.exchangeCards(driver, 1, human1ExchangeNew, human1ExchangeOld);
		
		Hand human1FinalHand = new Hand();
		human1FinalHand.addCard(card11);
		human1FinalHand.addCard(card12);
		human1FinalHand.addCard(card13);
		human1FinalHand.addCard(card14);
		human1FinalHand.addCard(card16);
		
		// Have the second player keep their three of a kind and exchange the rest
		Card card26 = new Card("rank-4", "diams");
		Card card27 = new Card("rank-6", "hearts");
		Hand human2ExchangeNew = new Hand();
		human2ExchangeNew.addCard(card26);
		human2ExchangeNew.addCard(card27);		
		Hand human2ExchangeOld = new Hand();
		human2ExchangeOld.addCard(card24);
		human2ExchangeOld.addCard(card25);
		Utils.exchangeCards(driver, 2, human2ExchangeNew, human2ExchangeOld);
		
		Hand human2FinalHand = new Hand();
		human2FinalHand.addCard(card21);
		human2FinalHand.addCard(card22);
		human2FinalHand.addCard(card23);
		human2FinalHand.addCard(card26);
		human2FinalHand.addCard(card27);

		// Have the third player keep their pair and exchange the rest of their cards
		// Let's give them a full house
		Card card36 = new Card("rank-2", "hearts");
		Card card37 = new Card("rank-a", "spades");
		Card card38 = new Card("rank-7", "hearts");
		Hand human3ExchangeNew = new Hand();
		human3ExchangeNew.addCard(card36);
		human3ExchangeNew.addCard(card37);
		human3ExchangeNew.addCard(card38);
		Hand human3ExchangeOld = new Hand();
		human3ExchangeOld.addCard(card33);
		human3ExchangeOld.addCard(card34);
		human3ExchangeOld.addCard(card35);
		Utils.exchangeCards(driver, 3, human3ExchangeNew, human3ExchangeOld);
		
		Hand human3FinalHand = new Hand();
		human3FinalHand.addCard(card31);
		human3FinalHand.addCard(card32);
		human3FinalHand.addCard(card36);
		human3FinalHand.addCard(card37);
		human3FinalHand.addCard(card38);
		
		// Have the fourth player hold
		driver.findElement(By.id("hold-btn")).click();
		
		
		//Check that the final hands match the expected hands
		Hand human1HandFinal = Utils.playerHand(driver, 1);
		Assert.assertEquals(true, Utils.areHandsEqual(human1FinalHand, human1HandFinal));
		Hand human2HandFinal = Utils.playerHand(driver, 2);
		Assert.assertEquals(true, Utils.areHandsEqual(human2FinalHand, human2HandFinal));
		Hand human3HandFinal = Utils.playerHand(driver, 3);
		Assert.assertEquals(true, Utils.areHandsEqual(human3FinalHand, human3HandFinal));
		Hand human4HandFinal = Utils.playerHand(driver, 4);
		Assert.assertEquals(true, Utils.areHandsEqual(human4Hand, human4HandFinal));
		
		//Check the player rankings
		Hashtable<String, String> results = new Hashtable<String, String>();
		results.put("Player 1", "ranked 3");
		results.put("Player 2", "ranked 2");
		results.put("Player 3", "ranked 4");
		results.put("Player 4", "ranked 1");
		Assert.assertEquals(true, Utils.expectedWinnersMatch(driver, results));
	}	

	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}
}
