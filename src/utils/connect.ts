import mongoose from "mongoose";
import _default from "../config/default";
import log from "./logger";

export default async function connect() {
  const dbUri = _default.dbUri;

  try {
    await mongoose.connect(dbUri);
    log.info("DB is connected");
  } catch (error) {
    log.error("Could not connect to db");
    process.exit(1);
  }
}
