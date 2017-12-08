package selenium;

import java.util.concurrent.TimeUnit;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.fail;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class JoinGameTests {
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser(){
		System.setProperty(Utils.GECKO_PROPERTY, Utils.GECKO_DRIVER);
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	} 

	@Test
	public void playerJoin() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);
		
		//Try to press the play button
		if(!Utils.clickIfExists(driver, "play-again")) {
			fail();
			return;
		}

		// Give time to join
		Utils.pause(Utils.JOIN_TIME);

		// Assert received cards after join
		Hand hand = Utils.playerHand(driver, 1);
		Assert.assertNotEquals(null, hand);
		Assert.assertEquals(5, hand.numCardsShowing());
	}

	@Test
	public void AIJoin() {
		driver.get(Utils.BASE_URL+Utils.FLUSH_GAME);
		driver.get(Utils.BASE_URL);

		// Assert can join
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		// Give time to join
		Utils.pause(Utils.JOIN_TIME);

		// Assert received cards after join
		Hand hand = Utils.playerHand(driver, 1);
		Assert.assertNotEquals(null, hand);
		Assert.assertEquals(5, hand.numCardsFaceDown());
	}

	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}
}
