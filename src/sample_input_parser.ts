import readline from "readline";
import { TaxiFareCalculator } from "./calculator.js";

export const receiveInputLineByLine = async () => {
  //

  const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("input distance meter with format hh:mm:ss.fff xxxxxxxx.f");
  console.log("click enter once to next input");
  console.log("click enter twice to stop input and see the fare including sorted distance meter");
  console.log("================================================================================");

  // start prompt
  userInterface.prompt();

  // instantiate calculator
  const tfc = new TaxiFareCalculator();

  // loop in input per line
  userInterface.on("line", async (input) => {
    //

    // remove blank space
    const userInput = input.trim();

    // empty input will stop the loop input per line
    if (userInput.length === 0) {
      console.log(tfc.getCalculatedFare());
      console.log(tfc.getSortedDistanceMeter().join("\n"));
      userInterface.close();
      return;
    }

    try {
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
