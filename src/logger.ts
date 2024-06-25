import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info", // change to debug to see more detail
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    //
    new transports.Console(),
    new transports.File({ filename: "logs/app.log" }),
  ],
});

export default logger;
