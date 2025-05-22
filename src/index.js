import { configDotenv } from "dotenv";
import dbConnect from "./db/dbConnect.js";
import app from "./app.js";

configDotenv({ path: "./.env" });

const PORT = process.env.PORT || 8000;

dbConnect().then(() => {
  try {
    app.listen(PORT, () => {
      console.log(`app running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
});
