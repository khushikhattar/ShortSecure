import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app";
dotenv.config();
const startServer = async () => {
  const mongoUrl = process.env.DATABASE_URL;
  if (!mongoUrl) {
    console.error("MongoDB URL is not defined in the environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};
startServer();
const PORT = process.env.PORT || 3100;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
