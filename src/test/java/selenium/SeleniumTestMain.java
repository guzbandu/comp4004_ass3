package selenium;

import java.io.FileNotFoundException;

public class SeleniumTestMain {

	/**
	 * Call all of the JUnit test methods. 
	 * This is based on the code written by Zach R.
	 * This allows a jar file to be created for the test code.
	 */
	public static void main(String[] args) {
		Logger logger;
		
		try {
			logger = new Logger("PokerTests.txt");
		} catch (FileNotFoundException e) {
			System.out.println(e.getMessage());
			return;
		}

		testPreGame(logger);
		testJoinGame(logger);
		testNormalPlay(logger);
		testExchanges(logger);
		testPlayer(logger);
		testStrategy1(logger);
		testStrategy2(logger);
		testStrategy3(logger);
		testStrategy4(logger);
	}
	
	public static void testPreGame(Logger logger) {
		PreGameTests pregame = new PreGameTests();
		
		try {
			logger.logStartTest("PreGameTests.validStartPageView");
			PreGameTests.openBrowser();
			pregame.validStartPageView();
			PreGameTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
		
		try {
			logger.logStartTest("PreGameTests.noPlayersAdded");
			PreGameTests.openBrowser();
			pregame.noPlayersAdded();
			PreGameTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
	}
	
	public static void testJoinGame(Logger logger) {
		JoinGameTests joingame = new JoinGameTests();
		
		try {
			logger.logStartTest("JoinGameTests.playerJoin");
			JoinGameTests.openBrowser();
			joingame.playerJoin();
			JoinGameTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
		
		try {
			logger.logStartTest("JoinGameTests.AIJoin");
			JoinGameTests.openBrowser();
			joingame.AIJoin();
			JoinGameTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
	}
	
	public static void testNormalPlay(Logger logger) {
		NormalPlayTests normalplay = new NormalPlayTests();
		
		try {
			logger.logStartTest("NormalPlayTests.fourAIPlay");
			NormalPlayTests.openBrowser();
			normalplay.fourAIPlay();
			NormalPlayTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
	}
	
	public static void testExchanges(Logger logger) {
		ExchangeTests exchangetests = new ExchangeTests();
		
		try {
			logger.logStartTest("ExchangeTests.tradeAllCards");
			ExchangeTests.openBrowser();
			exchangetests.tradeAllCards();
			ExchangeTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
		
		try {
			logger.logStartTest("ExchangeTests.tradeOneCard");
			ExchangeTests.openBrowser();
			exchangetests.tradeOneCard();
			ExchangeTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
		
		try {
			logger.logStartTest("ExchangeTests.tradeTwoCards");
			ExchangeTests.openBrowser();
			exchangetests.tradeTwoCards();
			ExchangeTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
		
		try {
			logger.logStartTest("ExchangeTests.tradeThreeCards");
			ExchangeTests.openBrowser();
			exchangetests.tradeThreeCards();
			ExchangeTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
	}
	
	public static void testPlayer(Logger logger) {
		PlayerTests player = new PlayerTests();
		
		try {
			logger.logStartTest("PlayerTests.playerSequence1");
			PlayerTests.openBrowser();
			player.playerSequence1();
			PlayerTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
		
		try {
			logger.logStartTest("PlayerTests.playerSequence2");
			PlayerTests.openBrowser();
			player.playerSequence2();
			PlayerTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}

		try {
			logger.logStartTest("PlayerTests.playerSequence3");
			PlayerTests.openBrowser();
			player.playerSequence3();
			PlayerTests.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}
	}
	
	public static void testStrategy1(Logger logger) {
		StrategyTest1 strategytest1 = new StrategyTest1();
		
		try {
			logger.logStartTest("StrategyTest1.aiStrategy2play2");
			StrategyTest1.openBrowser();
			strategytest1.aiStrategy2play2();
			StrategyTest1.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}		
	}
	
	public static void testStrategy2(Logger logger) {
		StrategyTest2 strategytest2 = new StrategyTest2();
		
		try {
			logger.logStartTest("StrategyTest2.aiStrategy1play2");
			StrategyTest2.openBrowser();
			strategytest2.aiStrategy1play2();
			StrategyTest2.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}		
	}
	
	public static void testStrategy3(Logger logger) {
		StrategyTest3 strategytest3 = new StrategyTest3();
		
		try {
			logger.logStartTest("StrategyTest3.aiStrategy1play1");
			StrategyTest3.openBrowser();
			strategytest3.aiStrategy1play1();
			StrategyTest3.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}		
	}

	public static void testStrategy4(Logger logger) {
		StrategyTest4 strategytest4 = new StrategyTest4();
		
		try {
			logger.logStartTest("StrategyTest4.aiStrategy2play1");
			StrategyTest4.openBrowser();
			strategytest4.aiStrategy2play1();
			StrategyTest4.closeBrowser();
			logger.logTestResult(true);
		} catch (AssertionError e) {
			logger.logTestResult(false, e.toString());
		}		
	}

}
