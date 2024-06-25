export const validateInput = (input: string) => {
  const regex = /^\d{2}:\d{2}:\d{2}\.\d{3} \d+\.\d$/;
  return regex.test(input);
};

export const parseTime = (timeString: string) => {
  const [hours, minutes, secondsMilliseconds] = timeString.split(":");
  const [seconds, milliseconds] = secondsMilliseconds.split(".");
  return parseInt(hours) * 3600000 + parseInt(minutes) * 60000 + parseInt(seconds) * 1000 + parseInt(milliseconds);
};

export const roundToDecimal = (num: number, decimalPlaces: number): number => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
};
