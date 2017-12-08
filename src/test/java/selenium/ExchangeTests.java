package selenium;

import static org.junit.Assert.fail;

import java.util.concurrent.TimeUnit;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;


public class ExchangeTests {
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser() {
		System.setProperty(Utils.GECKO_PROPERTY, Utils.GECKO_DRIVER);
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	}
	
	@Test
	public void tradeAllCards() {
		driver.get(Utils.BASE_URL+Utils.PREP_REAL_GAME);
		driver.get(Utils.BASE_URL);

		//Add an AI player with nothing in their hand
		//This is the first AI player so it will play first and exchange all cards
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
		
		//Add a second AI with any hand
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		// Give time to join, start the game, play each other and finish the game
		Utils.pause(Utils.JOIN_TIME+Utils.REAL_START_GAME+2*Utils.AI_REAL_TURN);
		
		boolean nothingMatches = true;
		//Confirm that the first AI has a whole new hand
		for(int i=0; i<ai1Hand.numCardsShowing(); i++) {
			if(Utils.doesHandContainCard(driver, ai1Hand.getShowingCard(i), 1)) {
				nothingMatches = false;
				break;
			}
		}
		
		Assert.assertEquals(true, nothingMatches);
	}
	
	@Test
	public void tradeOneCard() {
		driver.get(Utils.BASE_URL+Utils.PREP_REAL_GAME);
		driver.get(Utils.BASE_URL);

		//Add an AI player with two pair in their hand
		//This is the first AI player so it will play first and exchange one card
		Card card11 = new Card("rank-3", "hearts");
		Card card12 = new Card("rank-3", "spades");
		Card card13 = new Card("rank-7", "clubs");
		Card card14 = new Card("rank-7", "hearts");
		Card card15 = new Card("rank-8", "clubs");
		Hand ai1Hand = new Hand();
		ai1Hand.addCard(card11);
		ai1Hand.addCard(card12);
		ai1Hand.addCard(card13);
		ai1Hand.addCard(card14);
		ai1Hand.addCard(card15);
		Utils.addAI(driver, ai1Hand);
		
		//Add a second AI with any hand
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		// Give time to join, start the game, play each other and finish the game
		Utils.pause(Utils.JOIN_TIME+Utils.REAL_START_GAME+2*Utils.AI_REAL_TURN);
		
		Hand ai1HandShouldKeep = new Hand();
		ai1HandShouldKeep.addCard(card11);
		ai1HandShouldKeep.addCard(card12);
		ai1HandShouldKeep.addCard(card13);
		ai1HandShouldKeep.addCard(card14);
		
		Hand ai1HandShouldExchange = new Hand();
		ai1HandShouldExchange.addCard(card15);
				
		//Confirm that the first AI has kept its two pair
		boolean theyMatch = true;
		for(int i=0; i<ai1HandShouldKeep.numCardsShowing(); i++) {
			if(!Utils.doesHandContainCard(driver, ai1HandShouldKeep.getShowingCard(i), 1)) {
				theyMatch = false;
				break;
			}
		}
		Assert.assertEquals(true, theyMatch);
		
		//Confirm that the first AI has exchanged its single card
		boolean itsgone = true;
		for(int i=0; i<ai1HandShouldExchange.numCardsShowing(); i++) {
			if(Utils.doesHandContainCard(driver, ai1HandShouldExchange.getShowingCard(i), 1)) {
				itsgone = false;
				break;
			}
		}
		Assert.assertEquals(true, itsgone);				
	}
	
	@Test
	public void tradeTwoCards() {
		driver.get(Utils.BASE_URL+Utils.PREP_REAL_GAME);
		driver.get(Utils.BASE_URL);

		//Add an AI player with three of a kind in their hand
		//This is the first AI player so it will play first and exchange two cards
		Card card11 = new Card("rank-3", "hearts");
		Card card12 = new Card("rank-3", "spades");
		Card card13 = new Card("rank-3", "clubs");
		Card card14 = new Card("rank-7", "hearts");
		Card card15 = new Card("rank-8", "clubs");
		Hand ai1Hand = new Hand();
		ai1Hand.addCard(card11);
		ai1Hand.addCard(card12);
		ai1Hand.addCard(card13);
		ai1Hand.addCard(card14);
		ai1Hand.addCard(card15);
		Utils.addAI(driver, ai1Hand);
		
		//Add a second AI with any hand
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		// Give time to join, start the game, play each other and finish the game
		Utils.pause(Utils.JOIN_TIME+Utils.REAL_START_GAME+2*Utils.AI_REAL_TURN);
		
		Hand ai1HandShouldKeep = new Hand();
		ai1HandShouldKeep.addCard(card11);
		ai1HandShouldKeep.addCard(card12);
		ai1HandShouldKeep.addCard(card13);
		
		Hand ai1HandShouldExchange = new Hand();
		ai1HandShouldExchange.addCard(card14);
		ai1HandShouldExchange.addCard(card15);
				
		//Confirm that the first AI has kept its three of a kind
		boolean theyMatch = true;
		for(int i=0; i<ai1HandShouldKeep.numCardsShowing(); i++) {
			if(!Utils.doesHandContainCard(driver, ai1HandShouldKeep.getShowingCard(i), 1)) {
				theyMatch = false;
				break;
			}
		}
		Assert.assertEquals(true, theyMatch);
		
		//Confirm that the first AI has exchanged its two singles
		boolean itsgone = true;
		for(int i=0; i<ai1HandShouldExchange.numCardsShowing(); i++) {
			if(Utils.doesHandContainCard(driver, ai1HandShouldExchange.getShowingCard(i), 1)) {
				itsgone = false;
				break;
			}
		}
		Assert.assertEquals(true, itsgone);				
	}
	
	@Test
	public void tradeThreeCards() {
		driver.get(Utils.BASE_URL+Utils.PREP_REAL_GAME);
		driver.get(Utils.BASE_URL);

		//Add an AI player with two of a kind in their hand
		//This is the first AI player so it will play first and exchange three cards
		Card card11 = new Card("rank-3", "hearts");
		Card card12 = new Card("rank-3", "spades");
		Card card13 = new Card("rank-5", "clubs");
		Card card14 = new Card("rank-7", "hearts");
		Card card15 = new Card("rank-8", "clubs");
		Hand ai1Hand = new Hand();
		ai1Hand.addCard(card11);
		ai1Hand.addCard(card12);
		ai1Hand.addCard(card13);
		ai1Hand.addCard(card14);
		ai1Hand.addCard(card15);
		Utils.addAI(driver, ai1Hand);
		
		//Add a second AI with any hand
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		// Give time to join, start the game, play each other and finish the game
		Utils.pause(Utils.JOIN_TIME+Utils.REAL_START_GAME+2*Utils.AI_REAL_TURN);
		
		Hand ai1HandShouldKeep = new Hand();
		ai1HandShouldKeep.addCard(card11);
		ai1HandShouldKeep.addCard(card12);
		
		Hand ai1HandShouldExchange = new Hand();
		ai1HandShouldExchange.addCard(card13);
		ai1HandShouldExchange.addCard(card14);
		ai1HandShouldExchange.addCard(card15);
				
		//Confirm that the first AI has kept its two of a kind
		boolean theyMatch = true;
		for(int i=0; i<ai1HandShouldKeep.numCardsShowing(); i++) {
			if(!Utils.doesHandContainCard(driver, ai1HandShouldKeep.getShowingCard(i), 1)) {
				theyMatch = false;
				break;
			}
		}
		Assert.assertEquals(true, theyMatch);
		
		//Confirm that the first AI has exchanged its three singles
		boolean itsgone = true;
		for(int i=0; i<ai1HandShouldExchange.numCardsShowing(); i++) {
			if(Utils.doesHandContainCard(driver, ai1HandShouldExchange.getShowingCard(i), 1)) {
				itsgone = false;
				break;
			}
		}
		Assert.assertEquals(true, itsgone);				
	}

	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}
}
