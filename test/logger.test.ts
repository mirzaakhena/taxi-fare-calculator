import { TaxiFareCalculator } from "../src/calculator";
import logger from "../src/logger";

jest.mock("../src/logger.js");

describe("TaxiFareCalculator with logging", () => {
  let calculator: TaxiFareCalculator;

  beforeEach(() => {
    calculator = new TaxiFareCalculator();
    logger.info = jest.fn();
    logger.error = jest.fn();
  });

  it("should log info when adding a valid record", () => {
    calculator.addRecord("00:00:00.000 0.0");
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ action: "addRecord" }));
  });

  it("should log error for invalid record format", () => {
    try {
      calculator.addRecord("invalid record");
    } catch (e) {}
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ action: "addRecord", error: "Invalid input format. Valid format should be like this: hh:mm:ss.fff xxxxxxxx.f" })
    );
  });
});
