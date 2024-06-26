# Taxi Fare Calculator

A TypeScript-based taxi fare calculator that allows for flexible fare calculation algorithms, detailed logging, and easy integration with different input methods.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Running in Dev Mode](#running-in-dev-mode)
- [Running in Production Mode](#running-in-production-mode)
- [Running Tests](#running-tests)
- [Usage](#usage)
- [Logs](#logs)
- [Test Case](#test-case)

## Features

- **Separation of Concerns:** Core logic is decoupled from auxiliary services like logging.
- **Modular Components:** Each component handles a specific responsibility, making the code maintainable and extensible.
- **Flexible Fare Calculation:** You can set custom fare calculation algorithms without modifying the core class.
- **Optional Logger:** The system functions normally even if no logger is provided.
- **Detailed Error Handling:** Specific error messages and logging make debugging easier.
- **Data Validation and Parsing:** Ensures input data is correctly formatted and logically coherent.
- **Type Safety:** Uses TypeScript for compile-time type safety.
- **Record Management:** Handles the addition, validation, and sorting of records efficiently.

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/mirzaakhena/taxi-fare-calculator.git
   cd taxi-fare-calculator
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Running in dev mode

```bash
npm run dev
```

## Running in production mode

First you need to build it

```bash
npm run build
```

Then you can run it directly from /dist directory

```bash
npm run start
```

## Running test

```bash
npm test
```

## Usage

1. Manual Direct Input. See `sample_input_manual.ts`
2. Manual Direct Input with Custom Algorithm `sample_input_change_fare_algorithm.ts`
3. Receive Input Line by Line `sample_input_line_by_line.ts`

You may enable it by comment / uncomment it in `index.ts` then run it in dev mode.

```typescript
import { receiveInputLineByLine } from "./sample_input_line_by_line.js";
import { manualDirectInput } from "./sample_input_manual.js";
import { manualDirectInputWithChangingAlgorithm } from "./sample_input_change_fare_algorithm.js";

receiveInputLineByLine();
// manualDirectInput();
// manualDirectInputWithChangingAlgorithm();
```

## Logs

When using the sample from `receiveInputLineByLine`, it uses `winston` library that store all the log in `logs/app.log`.

## Test Case

### Adding Records:

- Valid Records: Test that valid records are added without errors.

- Invalid Format: Test that an error is thrown for invalid record format.

- Blank Line: Test that an error is thrown for a blank line.

- Past Time: Test that an error is thrown when a record with past time is added.

- Interval More Than 5 Minutes: Test that an error is thrown when the interval between records exceeds 5 minutes.

- Smaller Distance: Test that an error is thrown when a new record has a smaller distance than the previous record.

### Fare Calculation:

- Fewer Than 2 Records: Test that an error is thrown if there are fewer than two records.

- One Record: Test that an error is thrown if there is only one record.

- No Movement: Test that an error is thrown if there is no movement (total mileage is 0.0 m).

- Edge Case (Up to 1 km): Test that the fare is correctly calculated for distances just over 1 km.

- Up to 1 km: Test that the fare is 400 yen for distances up to 1 km.

- Up to 10 km: Test that the fare is correctly calculated for distances up to 10 km.

- Over 10 km: Test that the fare is correctly calculated for distances over 10 km.

- Changing Fare Algorithm: Test that the fare calculation algorithm can be changed and applied correctly.

### Sorted Records:

- Sorted by Distance Difference: Test that records are correctly sorted by distance difference.

### Base Fare:

- Up to 1 km: Test that the base fare is 400 yen for distances up to 1 km.

- 1 km to 10 km: Test that the fare is correctly calculated for distances between 1 km and 10 km.

- Over 10 km: Test that the fare is correctly calculated for distances over 10 km.
