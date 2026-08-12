import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import router from "../Routes/userRoute.js";
import { createTable } from "../Schema/appSchema.js";
import noteBookRouter from "../Routes/noteBookRoute.js";
import cookieParser from "cookie-parser";


const app = express();

const allowedOrigins = [
  "https://google-collab-front-end.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

createTable();

app.use("/user", router);
app.use("/notebook",noteBookRouter)

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;
