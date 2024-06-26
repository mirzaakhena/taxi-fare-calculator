import { createLogger, format, transports } from "winston";

/**
 * sample logger implementation with winston library
 */
const logger = createLogger({
  level: "info", // change to debug to see more detail
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    //
    // new transports.Console(), // uncomment it to show the log in console
    new transports.File({ filename: "logs/app.log" }),
  ],
});

export default logger;
