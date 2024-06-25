import { parseTime, roundToDecimal, validateInput } from "./utils.js";

export type TaxiFareRecord = {
  rawInput: string;
  time: number;
  distance: number;
  distanceDifference: number;
};

export class TaxiFareCalculator {
  //

  private records: TaxiFareRecord[];

  constructor() {
    this.records = [];
  }

  /**
   *
   * @param rawInput receive input with format input hh:mm:ss.fff xxxxxxxx.f
   */
  public addRecord(rawInput: string) {
    //

    if (!validateInput(rawInput)) {
      throw new Error("Invalid input format. Valid format should be like this: hh:mm:ss.fff xxxxxxxx.f");
    }

    // split between time and distance
    const [time, distance] = rawInput.split(" ");

    // convert distance to number format
    const distanceFloat = roundToDecimal(parseFloat(distance), 1);

    // convert time to number format
    const parsedTime = parseTime(time);

    // do we need also to handle when time = 0 but distance > 0 ?

    let lastRecordDistance = 0;

    // skip checking for the first time
    if (this.records.length > 0) {
      //

      const lastRecord = this.records[this.records.length - 1];
      if (parsedTime < lastRecord.time) {
        throw new Error("Past time received");
      }

      const timeDifference = (parsedTime - lastRecord.time) / 1000 / 60; // in minutes
      if (timeDifference > 5) {
        throw new Error("Interval between records is more than 5 minutes");
      }

      lastRecordDistance = lastRecord.distance;
    }

    const distanceDifference = roundToDecimal(distanceFloat - lastRecordDistance, 1);

    // add to record list also keep the raw input
    this.records.push({ time: parsedTime, distance: distanceFloat, rawInput, distanceDifference });
  }

  /**
   *
   * @returns fare based on fare formula calculation
   */
  public getCalculatedFare(): number {
    //

    if (this.records.length < 2) {
      return 0;
    }

    const latestDistance = this.records[this.records.length - 1].distance;

    return TaxiFareCalculator.getFare(latestDistance);
  }

  /**
   *
   * @param distance receive the latest distance
   * @returns fare based on formula
   */
  public static getFare(distance: number): number {
    //

    const round = (x: number) => Math.floor(x);

    const BASE_FARE = 400;

    // 1. The base fare is 400 yen for up to 1 km.
    if (distance <= 1_000) {
      return BASE_FARE;
    }

    // 2. Up to 10 km, 40 yen is added every 400 meters.
    else if (distance <= 10_000) {
      //
      const extraMeters = roundToDecimal(distance - 1_000, 1);
      const extraFare = round(extraMeters / 400) * 40;
      return BASE_FARE + extraFare;
    }

    // 3. Over 10km, 40 yen is added every 350 meters.
    else {
      //
      const FARE_UP_TO_10_KM = round(9_000 / 400) * 40;
      const extraMeters = roundToDecimal(distance - 10_000, 1);
      const extraFare = round(extraMeters / 350) * 40;
      return BASE_FARE + FARE_UP_TO_10_KM + extraFare;
    }
  }

  /**
   *
   * @returns sorted rawInput including distance difference
   */
  public getSortedDistanceMeter(): string[] {
    return this.records //
      .sort((a, b) => b.distanceDifference - a.distanceDifference)
      .map((record) => `${record.rawInput} ${record.distanceDifference.toFixed(1)}`);
  }
}
