import { Router } from "express";
import { authMiddleware } from "../Utils/auth.js";
import {
  createNotebook,
  getAllNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
} from "../Controllers/notebookController.js";

const noteBookRouter = Router();

// All routes below require a valid logged-in user
noteBookRouter.get("/", authMiddleware, getAllNotebooks); // GET    /notebook
noteBookRouter.post("/create", authMiddleware, createNotebook); // POST   /notebook/create
noteBookRouter.get("/:id", authMiddleware, getNotebookById); // GET    /notebook/:id
noteBookRouter.put("/:id", authMiddleware, updateNotebook); // PUT    /notebook/:id
noteBookRouter.delete("/:id", authMiddleware, deleteNotebook); // DELETE /notebook/:id
noteBookRouter.post("/get:id", getAllNotebooks);

export default noteBookRouter;
