import { Router } from "express";
import { authMiddleware } from "../Utils/auth.js";
import {
  createNotebook,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
} from "../Controllers/notebookController.js";

const noteBookRouter = Router();

// All routes below require a valid logged-in user
noteBookRouter.post("/create", authMiddleware, createNotebook); // POST   /api/notebooks
// noteBookRouter.get("/", authMiddleware, getAllNotebooks);       // GET    /api/notebooks
noteBookRouter.get("/getbyid:id", authMiddleware, getNotebookById); // GET    /api/notebooks/:id
noteBookRouter.put("/update:id", authMiddleware, updateNotebook); // PUT    /api/notebooks/:id
noteBookRouter.delete("/delete:id", authMiddleware, deleteNotebook); // DELETE /api/notebooks/:id

export default noteBookRouter;
