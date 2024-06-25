import { TaxiFareCalculator } from "./calculator.js";

export const manualDirectInput = () => {
  //

  try {
    //
    // instantiate calculator
    const calculator = new TaxiFareCalculator();

    // add records
    calculator.addRecord("00:00:00.000 0.0");
    calculator.addRecord("00:01:00.123 480.9");
    calculator.addRecord("00:02:00.125 1141.2");
    calculator.addRecord("00:03:00.100 1800.8");

    // calculate fare and output it
    console.log(calculator.getCalculatedFare());
    console.log(calculator.getSortedDistanceMeter().join("\n"));
  } catch (error: any) {
    //
    // print error
    console.error(error.message);
  }
};
