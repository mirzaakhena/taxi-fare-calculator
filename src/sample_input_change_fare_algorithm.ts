import { TaxiFareCalculator } from "./taxi_fare_calculator.js";

export const manualDirectInputWithChangingAlgorithm = () => {
  //

  try {
    //

    // instantiate calculator without logger
    const calculator = new TaxiFareCalculator();

    // this is just sample demonstration to show
    // that we can easily change the algorithm
    // without modify the TaxiFareCalculator class
    const linierFlatSillyPrice = (distance: number) => {
      // the taxi charge 10 yen for every 100 meters
      return Math.round((distance / 100) * 10);
    };

    // change the algorithm
    calculator.setFareAlgorithm(linierFlatSillyPrice);

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
