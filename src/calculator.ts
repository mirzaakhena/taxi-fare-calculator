import { parseTime, roundToDecimal, validateInput } from "./utils.js";
import logger from "./logger.js";
import { log } from "winston";

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

    try {
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

      const record = { time: parsedTime, distance: distanceFloat, rawInput, distanceDifference };

      // add to record list also keep the raw input
      this.records.push(record);

      logger.info({ action: "addRecord", data: record });

      if (this.records.length > 1) {
        //
        const totalMileage = this.records.reduce((sum, record) => sum + record.distanceDifference, 0);

        if (totalMileage === 0.0) {
          throw new Error("Total mileage is 0.0 m");
        }
      }
    } catch (error: any) {
      logger.error({ action: "addRecord", error: error.message });
      throw error;
    }
  }

  /**
   *
   * @returns fare based on fare formula calculation
   */
  public getCalculatedFare(): number {
    //

    if (this.records.length < 2) {
      logger.error({ action: "getCalculatedFare", error: "Less than two records" });
      return 0;
    }

    const latestDistance = this.records[this.records.length - 1].distance;

    const fare = TaxiFareCalculator.getFare(latestDistance);

    logger.info({ action: "getCalculatedFare", data: { latestDistance, fare } });

    return fare;
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
      logger.debug({ action: "getFare", data: { distance, fare: BASE_FARE, info: "up to 1 km" } });
      return BASE_FARE;
    }

    // 2. Up to 10 km, 40 yen is added every 400 meters.
    else if (distance <= 10_000) {
      //
      const extraMeters = roundToDecimal(distance - 1_000, 1);
      const extraFare = round(extraMeters / 400) * 40;
      logger.debug({ action: "getFare", data: { distance, extraMeters, extraFare, fare: BASE_FARE + extraFare, info: "up to 10 km" } });
      return BASE_FARE + extraFare;
    }

    // 3. Over 10km, 40 yen is added every 350 meters.
    else {
      //
      const FARE_UP_TO_10_KM = round(9_000 / 400) * 40;
      const extraMeters = roundToDecimal(distance - 10_000, 1);
      const extraFare = round(extraMeters / 350) * 40;
      logger.debug({
        action: "getFare",
        data: { distance, extraMeters, extraFare, fare: BASE_FARE + extraFare, fareUpto10km: FARE_UP_TO_10_KM, info: "over 10 km" },
      });
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
