import { parseTime, roundToDecimal, validateInput } from "./utils.js";

/**
 * Main Data structure
 */
export type TaxiFareRecord = {
  rawInput: string;
  time: number;
  distance: number;
  distanceDifference: number;
};

export type LoggerMessage = {
  action: string;
  data?: any;
};

export type LoggerMessageWithError = LoggerMessage & {
  error?: any;
};

/**
 * Logger interface used by internal TaxiFareCalculator
 */
export interface TaxiFareCalculatorLogger {
  info(message: LoggerMessage): void;
  debug(message: LoggerMessage): void;
  error(message: LoggerMessageWithError): void;
}

/**
 * algorthim function type
 */
export type TaxiFareCalculatorAlgorithm = (distance: number, logger?: TaxiFareCalculatorLogger) => number;

/**
 *
 */
export class TaxiFareCalculator {
  //

  private records: TaxiFareRecord[];
  private logger?: TaxiFareCalculatorLogger;
  private fareAlgorithm: TaxiFareCalculatorAlgorithm;

  constructor(opt?: { logger: TaxiFareCalculatorLogger }) {
    this.records = [];
    this.logger = opt?.logger;

    // default algorithm
    this.fareAlgorithm = TaxiFareCalculator.getFare;
  }

  /**
   * Set Other Fare algorithm
   * @param alg
   */
  public setFareAlgorithm(alg: TaxiFareCalculatorAlgorithm) {
    this.fareAlgorithm = alg;
  }

  /**
   *
   * @param rawInput receive input with format input hh:mm:ss.fff xxxxxxxx.f
   */
  public addRecord(rawInput: string) {
    //

    try {
      //

      if (!rawInput.trim()) {
        throw new Error("Blank line received");
      }

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
        if (parsedTime <= lastRecord.time) {
          throw new Error("Past time received");
        }

        const timeDifference = (parsedTime - lastRecord.time) / 1000 / 60; // in minutes
        if (timeDifference > 5) {
          throw new Error("Interval between records is more than 5 minutes");
        }

        if (distanceFloat < lastRecord.distance) {
          throw new Error("New distance is smaller than the previous distance.");
        }

        lastRecordDistance = lastRecord.distance;
      }

      const distanceDifference = roundToDecimal(distanceFloat - lastRecordDistance, 1);

      const record = { time: parsedTime, distance: distanceFloat, rawInput, distanceDifference };

      // add to record list also keep the raw input
      this.records.push(record);

      this.logger?.info({ action: "addRecord", data: record });
    } catch (error: any) {
      this.logger?.error({ action: "addRecord", error: error.message });
      throw error;
    }
  }

  /**
   *
   * @returns fare based on fare formula calculation
   */
  public getCalculatedFare(): number {
    //

    try {
      if (this.records.length < 2) {
        throw new Error("Less than two records");
      }

      const totalMileage = this.records.reduce((sum, record) => sum + record.distanceDifference, 0);
      if (totalMileage === 0.0) {
        throw new Error("Total mileage is 0.0 m");
      }

      const latestDistance = this.records[this.records.length - 1].distance;

      const fare = this.fareAlgorithm(latestDistance);

      this.logger?.info({ action: "getCalculatedFare", data: { latestDistance, fare } });

      return fare;

      //
    } catch (error: any) {
      this.logger?.error({ action: "getCalculatedFare", error: error.message });
      throw error;
    }
  }

  /**
   *
   * @returns sorted rawInput including distance difference
   */
  public getSortedDistanceMeter(): string[] {
    //

    const records = this.records //
      .sort((a, b) => b.distanceDifference - a.distanceDifference)
      .map((record) => `${record.rawInput} ${record.distanceDifference.toFixed(1)}`);

    this.logger?.info({ action: "getSortedDistanceMeter", data: { recordCount: records.length } });

    return records;
  }

  /**
   * Default implementation of getFare
   * @param distance receive the latest distance
   * @returns fare based on formula
   */
  public static getFare(distance: number, logger?: TaxiFareCalculatorLogger): number {
    //

    // const round = (x: number) => Math.ceil(x); // round up
    const round = (x: number) => Math.floor(x); // round down

    const BASE_FARE = 400;

    // 1. The base fare is 400 yen for up to 1 km.
    if (distance <= 1_000) {
      //
      logger?.debug({ action: "getFare", data: { distance, fare: BASE_FARE, info: "up to 1 km" } });
      return BASE_FARE;
    }

    // 2. Up to 10 km, 40 yen is added every 400 meters.
    else if (distance <= 10_000) {
      //
      const extraMeters = roundToDecimal(distance - 1_000, 1);
      const extraFare = round(extraMeters / 400) * 40;
      logger?.debug({ action: "getFare", data: { distance, extraMeters, extraFare, fare: BASE_FARE + extraFare, info: "up to 10 km" } });
      return BASE_FARE + extraFare;
    }

    // 3. Over 10km, 40 yen is added every 350 meters.
    else {
      //
      const FARE_UP_TO_10_KM = round(9_000 / 400) * 40;
      const extraMeters = roundToDecimal(distance - 10_000, 1);
      const extraFare = round(extraMeters / 350) * 40;
      logger?.debug({
        action: "getFare",
        data: { distance, extraMeters, extraFare, fare: BASE_FARE + FARE_UP_TO_10_KM + extraFare, fareUpto10km: FARE_UP_TO_10_KM, info: "over 10 km" },
      });
      return BASE_FARE + FARE_UP_TO_10_KM + extraFare;
    }
  }
}
