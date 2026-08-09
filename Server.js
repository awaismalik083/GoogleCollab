import dotenv from "dotenv";
dotenv.config();

import express from "express";
import router from "./Routes/userRoute.js";
import { createTable } from "./Schema/appSchema.js";

const port = 3000;
const app = express();

app.use(express.json());

createTable().catch((err) => {
  console.error("Table creation failed:", err);
});

app.use("/user", router);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
