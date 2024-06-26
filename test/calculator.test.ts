import { TaxiFareCalculator } from "../src/taxi_fare_calculator.js";

describe("TaxiFareCalculator", () => {
  //

  let calculator: TaxiFareCalculator;

  beforeEach(() => {
    calculator = new TaxiFareCalculator();
  });

  it("should add valid records without errors", () => {
    expect(() => calculator.addRecord("00:00:00.000 0.0")).not.toThrow();
    expect(() => calculator.addRecord("00:01:00.123 480.9")).not.toThrow();
  });

  it("should throw error for invalid record format", () => {
    const throwedMessage = "Invalid input format. Valid format should be like this: hh:mm:ss.fff xxxxxxxx.f";
    expect(() => calculator.addRecord("invalid record")).toThrow(throwedMessage);
  });

  it("should throw error for blank line", () => {
    const throwedMessage = "Blank line received";
    expect(() => calculator.addRecord("")).toThrow(throwedMessage);
  });

  it("should throw error for past time record", () => {
    calculator.addRecord("00:01:00.123 480.9");
    expect(() => calculator.addRecord("00:00:00.000 0.0")).toThrow("Past time received");
  });

  it("should throw error for time interval more than 5 minutes", () => {
    calculator.addRecord("00:00:00.000 0.0");
    expect(() => calculator.addRecord("00:06:00.000 600.0")).toThrow("Interval between records is more than 5 minutes");
  });

  it("should return 0 if there are fewer than 2 records", () => {
    expect(() => calculator.getCalculatedFare()).toThrow("Less than two records");
  });

  it("should return 0 if there are only 1 record", () => {
    calculator.addRecord("00:00:00.000 500.0");
    expect(() => calculator.getCalculatedFare()).toThrow("Less than two records");
  });

  it("should throw error if new distance is smaller than the previous distance", () => {
    calculator.addRecord("00:00:00.000 500.0");
    expect(() => calculator.addRecord("00:01:00.000 400.0")).toThrow("New distance is smaller than the previous distance.");
  });

  it("should handle case when not moving at all", () => {
    calculator.addRecord("00:00:00.000 0.0");
    calculator.addRecord("00:01:00.100 0.0");
    calculator.addRecord("00:02:00.200 0.0");
    calculator.addRecord("00:03:00.200 0.0");

    expect(() => calculator.getCalculatedFare()).toThrow("Total mileage is 0.0 m");
  });

  it("should handle edge case of fare calculation correctly", () => {
    calculator.addRecord("00:00:00.000 0.0");
    calculator.addRecord("00:01:00.100 999.9");
    calculator.addRecord("00:02:00.200 1000.1");

    // Fare should still be 400 since 1000.1 meters is just over 1 km
    expect(calculator.getCalculatedFare()).toBe(400);
    expect(calculator.getSortedDistanceMeter()).toEqual([
      //
      "00:01:00.100 999.9 999.9",
      "00:02:00.200 1000.1 0.2",
      "00:00:00.000 0.0 0.0",
    ]);
  });

  it("should calculate the correct fare for up to 1 km", () => {
    calculator.addRecord("00:00:00.000 500.0");
    calculator.addRecord("00:01:00.000 1000.0");

    expect(calculator.getCalculatedFare()).toBe(400);
  });

  it("should calculate the correct fare for up to 10 km", () => {
    calculator.addRecord("00:00:00.000 1000.0");
    calculator.addRecord("00:01:00.000 5000.0");

    expect(calculator.getCalculatedFare()).toBe(800);
  });

  it("should calculate the correct fare for over 10 km", () => {
    calculator.addRecord("00:00:00.000 1000.0");
    calculator.addRecord("00:01:00.000 11000.0");

    expect(calculator.getCalculatedFare()).toBe(1360);
  });

  it("should return sorted records by distance difference", () => {
    calculator.addRecord("00:00:00.000 0.0");
    calculator.addRecord("00:01:00.123 480.9");
    calculator.addRecord("00:02:00.125 1141.2");
    calculator.addRecord("00:03:00.100 1800.8");

    expect(calculator.getCalculatedFare()).toBe(480);
    expect(calculator.getSortedDistanceMeter()).toEqual([
      //
      "00:02:00.125 1141.2 660.3",
      "00:03:00.100 1800.8 659.6",
      "00:01:00.123 480.9 480.9",
      "00:00:00.000 0.0 0.0",
    ]);
  });

  it("should change the fare algorithm", () => {
    calculator.setFareAlgorithm((distance) => {
      // set constant value
      return 300;
    });

    // no matter how much the record added
    calculator.addRecord("00:00:00.000 0.0");
    calculator.addRecord("00:01:00.123 480.9");
    calculator.addRecord("00:02:00.125 1141.2");
    calculator.addRecord("00:03:00.100 1800.8");

    // the fare keep constant
    expect(calculator.getCalculatedFare()).toBe(300);
  });
});

describe("TaxiFareCalculator.getFare", () => {
  it("should return the base fare of 400 yen for up to 1 km", () => {
    expect(TaxiFareCalculator.getFare(1000)).toBe(400);
    expect(TaxiFareCalculator.getFare(500)).toBe(400);
  });

  it("should calculate the fare for distances between 1 km and 10 km", () => {
    expect(TaxiFareCalculator.getFare(2000)).toBe(480);
    expect(TaxiFareCalculator.getFare(8500)).toBe(1120);
  });

  it("should calculate the fare for distances over 10 km", () => {
    expect(TaxiFareCalculator.getFare(11000)).toBe(1360);
    expect(TaxiFareCalculator.getFare(20000)).toBe(2400);
  });
});
