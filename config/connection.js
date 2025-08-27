import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI");
}

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error(`Error connecting Database ${error}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
  });
  mongoose.connection.on("error", (err) => {
    console.log(`Mongoose connection error: ${err}`);
  });
}

export default connectToDB;
