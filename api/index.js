import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import router from "../Routes/userRoute.js";
import { createTable } from "../Schema/appSchema.js";

const app = express();

app.use(
  cors({
    
    origin: "https://google-collab-front-end.vercel.app/",
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
