import readline from "readline";
import { TaxiFareCalculator, TaxiFareCalculatorLogger } from "./taxi_fare_calculator.js";
import logger from "./logger.js";

/**
 * this logger implementation use the winston library
 */
class ImplLogger implements TaxiFareCalculatorLogger {
  debug(message: any): void {
    logger.debug(message);
  }

  error(message: any): void {
    logger.error(message);
  }

  info(message: any): void {
    logger.info(message);
  }
}

export const receiveInputLineByLine = async () => {
  //

  const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("input distance meter with format hh:mm:ss.fff xxxxxxxx.f");
  console.log("click enter once to input the next value");
  console.log("click enter twice to stop input and see the fare and sorted distance meter summary");
  console.log("================================================================================");

  // start prompt
  userInterface.prompt();

  // instantiate calculator with logger
  const tfc = new TaxiFareCalculator({
    logger: new ImplLogger(),
  });

  // loop in input per line
  userInterface.on("line", async (input) => {
    //

    // remove blank space
    const userInput = input.trim();

    try {
      //

      // empty input will stop the loop input per line
      if (userInput.length === 0) {
        console.log(tfc.getCalculatedFare());
        console.log(tfc.getSortedDistanceMeter().join("\n"));
        userInterface.close();
        return;
      }

      // add record
      tfc.addRecord(userInput);

      // restart prompt
      userInterface.prompt();

      //
    } catch (error: any) {
      // print error message
      console.log(error.message);

      // stop loop
      userInterface.close();

      // force to exit
      process.exit(1);
    }
  });
};
