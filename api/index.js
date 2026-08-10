import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import router from "../Routes/userRoute.js";
import { createTable } from "../Schema/appSchema.js";

const app = express();
const allowedOrigins = [
  "https://google-collab-front-end.vercel.app",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

createTable();

app.use("/user", router);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;
