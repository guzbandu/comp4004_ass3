package selenium;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class Logger {
	private FileOutputStream file = null;
	private int testCount = 0;
	private int passCount = 0;
	
	public Logger(String path) throws FileNotFoundException {
		file = new FileOutputStream(path, false);
	}
	
	public void close() {
		if (null != file) {
			log("Test suite complete. " + passCount + "/" + testCount
					+ " tests passed");
			try {
				file.close();
			} catch (IOException e) {
				System.out.println("Failed to close file: " + e.getMessage());
			}
		}
	}
	
	public void log(String log) {
		System.out.println(log);
		
		if(null == file)
			return;
		
		try {
			file.write(log.getBytes());
		} catch (IOException e) {
			System.out.println("Failed to write log: " + e.getMessage());
		}
	}
	
	public void logStartTest(String testFunc) {
		log("Running test: " + testFunc + "... ");
		testCount++;
	}
	
	public void logTestResult(boolean passed) {
		logTestResult(passed, null);
	}
	
	public void logTestResult(boolean passed, String msg) {
		String out = passed ? "PASS" : "FAIL";
		out += "\n";
		
		if (passed)
			passCount++;
		
		log(out);
		
		if(msg != null)
			log("    " + msg + "\n");
	}
}
