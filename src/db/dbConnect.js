import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("connected to database success fully");
  } catch (error) {
    console.log("can not connect to a database", error);
  }
};

export default dbConnect;
