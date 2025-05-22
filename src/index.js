import { configDotenv } from "dotenv";
import dbConnect from "./db/dbConnect.js";
import app from "./app.js";

configDotenv({ path: "./.env" });

dbConnect().then(() => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`app running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
});
