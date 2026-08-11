import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token; // changed from req.headers.authorization

    if (!token) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email } — matches the fixed signup/login payload

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid token, access denied" });
  }
};