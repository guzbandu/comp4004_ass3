package selenium;

import static org.junit.Assert.fail;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class Utils {
	
	public static final String GECKO_PROPERTY = "webdriver.gecko.driver";
	public static final String GECKO_DRIVER = "bin/geckodriver.exe";
	public static final String BASE_URL = "http://localhost:8080/";
	public static final String FLUSH_GAME = "api/flush-game";
	public static final String PREP_REAL_GAME = "api/prep-game";
	public static final int JOIN_TIME = 1000; //Can take a little bit of time to add players
	public static final int START_GAME = 2800; //2500 + 300 to be safe
	public static final int AI_TURN = 600; //500 + 100 to be safe
	public static final int TURN_WAIT = 800; //Can take a little bit of time for a turn to be passed on
	public static final int AI_REAL_TURN = 3600; //3500 + 100 to be safe
	public static final int REAL_START_GAME = 5300; //5000 + 300 to be safe

	// Pause the game. Just wraps the ugly try/catch
	public static void pause(long milliseconds) {
		try {
			Thread.sleep(milliseconds);
		} catch (InterruptedException e) {
			fail();
			return;
		}
	}
	
	// Return a count from the list of player divs at the table
	public static int playersAtTable(WebDriver driver) {
		return driver.findElements(By.cssSelector("#table .player-label")).size();
	}
	
	// Get player's hand by id (order joined game in)
	public static Hand playerHand(WebDriver driver, int id) {
		List<WebElement> tableHands = driver.findElements(By.cssSelector("#table #player-"+id+" .cards .hand"));

		Hand hand = new Hand();		
		WebElement handDiv = tableHands.get(0); //Each player only has one hand
		for (WebElement cardDiv: handDiv.findElements(By.className("card"))) {
			hand.addCard(htmlToCard(cardDiv));
		}
		return hand;
	}
	
	// Parse the div with expected classes "card", <rank>, <suit>
	// Return a card object, or NULL
	private static Card htmlToCard(WebElement div) {		
		String classes[] = div.getAttribute("class").split(" ");
		if (classes.length < 2) {
			return null;
		}
		if (!classes[0].equals("card")) {
			return null;
		}
		if (classes[1].equals("back")) {
			// Face down card
			return new Card("", "");
		}
		if (classes.length < 3) {
			return null;
		}
		
		return new Card(classes[1], classes[2]);
	}
	
	// Check if two hands contain exactly the same cards.
	// Return a boolean either true or false
	public static boolean areHandsEqual(Hand hand1,Hand hand2) {		
		for(int i=0; i<hand1.numCardsShowing(); i++) {
			if(!hand2.contains(hand1.getShowingCard(i)))
				return false;
		}
		return true;
	}
		
	public static boolean expectedWinnersMatch(WebDriver driver, Hashtable<String, String> winners) {
		boolean winnersMatch = true;
		List<WebElement> winnerResults = driver.findElements(By.cssSelector(".results"));
		if(winnerResults.isEmpty()) {
			return false;
		}
		for(WebElement resulth2: winnerResults) {
			Enumeration<String> names = winners.keys();
			while(names.hasMoreElements()) {
				String winnerName = (String)names.nextElement();
				if(resulth2.getText().contains(winnerName)) {
					if(!resulth2.getText().contains(winners.get(winnerName))) {
						winnersMatch = false;
						break;
					}
				}
			}
		}
		return winnersMatch;
	}
	
	public static void addHuman(WebDriver driver, Hand hand) {
		for(int i=0; i<hand.numCardsShowing(); i++) {
			driver.findElement(By.name("n"+(i+1)+"-r")).sendKeys(hand.getShowingCard(i).getRank().substring(hand.getShowingCard(i).getRank().indexOf("-")+1));
			driver.findElement(By.name("n"+(i+1)+"-s")).sendKeys(hand.getShowingCard(i).getSuit());
		}
		driver.findElement(By.id("test-add-human")).click();
	}
	
	public static void addAI(WebDriver driver, Hand hand) {
		for(int i=0; i<hand.numCardsShowing(); i++) {
			driver.findElement(By.name("n"+(i+1)+"-r")).sendKeys(hand.getShowingCard(i).getRank().substring(hand.getShowingCard(i).getRank().indexOf("-")+1));
			driver.findElement(By.name("n"+(i+1)+"-s")).sendKeys(hand.getShowingCard(i).getSuit());
		}
		driver.findElement(By.id("test-add-ai")).click();
	}
	
	public static void exchangeCards(WebDriver driver, int id, Hand newCards, Hand oldCards) {
		if(newCards.numCardsShowing()!=oldCards.numCardsShowing()) {
			System.out.println("Invalid parameters must exchange the same number of cards");
			return;
		}
		
		for(int i=0; i<newCards.numCardsShowing(); i++) {
			driver.findElement(By.name("n"+(i+1)+"-r")).sendKeys(newCards.getShowingCard(i).getRank().substring(newCards.getShowingCard(i).getRank().indexOf("-")+1));
			driver.findElement(By.name("n"+(i+1)+"-s")).sendKeys(newCards.getShowingCard(i).getSuit());
		}

		for(int i=0; i<oldCards.numCardsShowing(); i++) {
			driver.findElement(By.name("o"+(i+1)+"-r")).sendKeys(oldCards.getShowingCard(i).getRank().substring(oldCards.getShowingCard(i).getRank().indexOf("-")+1));
			driver.findElement(By.name("o"+(i+1)+"-s")).sendKeys(oldCards.getShowingCard(i).getSuit());
		}
		
		driver.findElement(By.name("playerid")).sendKeys(Integer.toString(id));
		
		driver.findElement(By.id("test-exchange-human")).click();
	}
	
	public static void exchangeCardsAI(WebDriver driver, int id, Hand newCards, Hand oldCards) {
		if(newCards.numCardsShowing()!=oldCards.numCardsShowing()) {
			System.out.println("Invalid parameters must exchange the same number of cards");
			return;
		}
		
		for(int i=0; i<newCards.numCardsShowing(); i++) {
			driver.findElement(By.name("n"+(i+1)+"-r")).sendKeys(newCards.getShowingCard(i).getRank().substring(newCards.getShowingCard(i).getRank().indexOf("-")+1));
			driver.findElement(By.name("n"+(i+1)+"-s")).sendKeys(newCards.getShowingCard(i).getSuit());
		}
		
		for(int i=0; i<oldCards.numCardsShowing(); i++) {
			driver.findElement(By.name("o"+(i+1)+"-r")).sendKeys(oldCards.getShowingCard(i).getRank().substring(oldCards.getShowingCard(i).getRank().indexOf("-")+1));
			driver.findElement(By.name("o"+(i+1)+"-s")).sendKeys(oldCards.getShowingCard(i).getSuit());
		}
		
		driver.findElement(By.name("playerid")).sendKeys(Integer.toString(id));
		
		driver.findElement(By.id("test-exchange-ai")).click();
	}
	
	public static boolean clickIfExists(WebDriver driver, String id) {
		WebElement button = driver.findElement(By.id(id));
		if (button == null || !button.isEnabled() || !button.isDisplayed())
			return false;
		
		button.click();
		return true;
	}
	
}
