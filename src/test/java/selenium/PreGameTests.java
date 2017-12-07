package selenium;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.concurrent.TimeUnit;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;

public class PreGameTests {		
	private static WebDriver driver;

	@BeforeClass
	public static void openBrowser(){
		System.setProperty("webdriver.gecko.driver", "bin/geckodriver");
		driver = new FirefoxDriver();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
		driver.get(Utils.BASE_URL);
	} 

	@Test
	public void validStartPageView(){
		// Assert "Join Game" button
		WebElement playAgain = driver.findElement(By.id("play-again"));
		Assert.assertEquals(true, playAgain.isDisplayed());
		Assert.assertEquals(true, playAgain.isEnabled());

		// Assert "Add AI" button
		WebElement addAi = driver.findElement(By.id("add-ai"));
		Assert.assertEquals(true, addAi.isDisplayed());
		Assert.assertEquals(true, addAi.isEnabled());

		// Assert 4 spots are open
		WebElement spots = driver.findElement(By.id("slot-count"));
		Assert.assertEquals("4", spots.getText());
	}
	
	@Test
	public void noPlayersAdded() {
		// Assert no players currently joined
		int numPlayersAtTable = Utils.playersAtTable(driver);
		Assert.assertEquals(0, numPlayersAtTable);
	}

	@AfterClass
	public static void closeBrowser() {
		driver.quit();
	}
}
