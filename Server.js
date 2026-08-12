import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import router from "../backend/Routes/userRoute.js";
import { createTable } from "../backend/Schema/appSchema.js";
import noteBookrouter from "./Routes/noteBookRoute.js";
import noteBookRouter from "./Routes/noteBookRoute.js";
import cookieParser from "cookie-parser";


const app = express();

const allowedOrigins = [
  "https://google-collab-front-end.vercel.app",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
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