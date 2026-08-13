import { pool } from "../Config/db.js";

// CREATE a new notebook
export const createNotebook = async (req, res) => {
  const userId = req.user.id; // assumes auth middleware sets req.user
  const { title } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO notebooks (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, title || "Untitled Notebook"]
    );

    return res.status(201).json({
      message: "Notebook created successfully",
      notebook: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating notebook:", err);
    return res.status(500).json({ message: "Server error while creating notebook" });
  }
};

// GET all notebooks belonging to the logged-in user
export const getAllNotebooks = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM notebooks
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    return res.status(200).json({
      count: result.rows.length,
      notebooks: result.rows,
    });
  } catch (err) {
    console.error("Error fetching notebooks:", err);
    return res.status(500).json({ message: "Server error while fetching notebooks" });
  }
};

// GET a single notebook by id (only if it belongs to the logged-in user)
export const getNotebookById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM notebooks WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    return res.status(200).json({ notebook: result.rows[0] });
  } catch (err) {
    console.error("Error fetching notebook:", err);
    return res.status(500).json({ message: "Server error while fetching notebook" });
  }
};

// UPDATE a notebook (title only)
export const updateNotebook = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title } = req.body;

  try {
    const result = await pool.query(
      `UPDATE notebooks
       SET title = COALESCE($1, title),
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [title, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    return res.status(200).json({
      message: "Notebook updated successfully",
      notebook: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating notebook:", err);
    return res.status(500).json({ message: "Server error while updating notebook" });
  }
};

// DELETE a notebook (only if it belongs to the logged-in user)
export const deleteNotebook = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM notebooks WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    return res.status(200).json({ message: "Notebook deleted successfully" });
  } catch (err) {
    console.error("Error deleting notebook:", err);
    return res.status(500).json({ message: "Server error while deleting notebook" });
  }
};