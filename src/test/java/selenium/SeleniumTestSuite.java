package selenium;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;


@RunWith(Suite.class)
@Suite.SuiteClasses({
	PreGameTests.class,
	JoinGameTests.class,
	NormalPlayTests.class,
	PlayerTests.class,
	StrategyTest1.class,
	StrategyTest2.class,
	StrategyTest3.class,
	StrategyTest4.class
})

public class SeleniumTestSuite {

}
