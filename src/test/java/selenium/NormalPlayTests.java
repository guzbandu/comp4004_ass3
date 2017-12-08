package selenium;

import static org.junit.Assert.fail;

import java.util.Hashtable;
import java.util.concurrent.TimeUnit;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class NormalPlayTests {
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser(){
		System.setProperty(Utils.GECKO_PROPERTY, Utils.GECKO_DRIVER);
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	} 

	@Test
	public void fourAIPlay() {
		driver.get(Utils.BASE_URL+Utils.PREP_REAL_GAME);
		driver.get(Utils.BASE_URL);

		// Have 4 UI's play each other
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}
		
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}
		
		if (!Utils.clickIfExists(driver, "add-ai")) {
			fail();
			return;
		}

		// Give time to join, start the game, play each other and finish the game
		Utils.pause(Utils.JOIN_TIME+Utils.REAL_START_GAME+4*Utils.AI_REAL_TURN);

		// Assert game results have been displayed
		Hashtable<String, String> results = new Hashtable<String, String>();
		results.put("Agent 1", "ranked");
		results.put("Agent 2", "ranked");
		results.put("Agent 3", "ranked");
		results.put("Agent 4", "ranked");
		Assert.assertEquals(true, Utils.expectedWinnersMatch(driver, results));
	}

	
	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}	
}
