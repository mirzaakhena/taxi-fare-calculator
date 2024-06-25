import { validateInput } from "../src/utils.js";

describe("validateInput", () => {
  it("should return true for valid input", () => {
    const validInputs = [
      //
      "12:34:56.789 5.0",
      "00:00:00.000 1.1",
      "23:59:59.999 9.9",
      "99:99:99.999 9.9",
    ];

    validInputs.forEach((input) => {
      expect({ input, isValid: validateInput(input) }).toStrictEqual({ input, isValid: true });
    });
  });

  it("should return false for invalid input", () => {
    const invalidInputs = [
      //
      "01:34:56.789 5.", // Missing decimal digit after dot
      "02:34:56.78 5.0", // Missing one millisecond digit
      "06:34:56.7895 5.0", // Extra digit in milliseconds
      "12:34:56.7895", // Missing the number part
      "47:34:56.789 5", // Missing decimal part
      "88:34:56.789 5.01", // More than one digit after dot
      "999:00:00.000 0.0", // extra digit in hour
    ];

    invalidInputs.forEach((input) => {
      expect({ input, isValid: validateInput(input) }).toStrictEqual({ input, isValid: false });
    });
  });
});
