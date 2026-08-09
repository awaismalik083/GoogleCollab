import dotenv from "dotenv";
import express from "express";
import router from "./Routes/userRoute.js";
import { createTable } from "./Schema/appSchema.js";
import cors from "cors";

dotenv.config();

const port = 3000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://google-collab-front-end.vercel.app/",
    credentials: true,
  }),
);

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
