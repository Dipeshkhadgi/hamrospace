import mongoose from "mongoose";
import { tryCatchAsyncError } from "../middlewares/tryCatchHandler.js";

const ConnectDB = tryCatchAsyncError(async () => {
  const { connection } = await mongoose.connect(process.env.MONGODB_URL);
  console.log(`MongoDB is connected at:${connection.host}`.cyan.underline.bold);
});
export default ConnectDB;
