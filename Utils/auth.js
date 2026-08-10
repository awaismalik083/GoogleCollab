import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // Expecting header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should contain whatever you signed at login, e.g. { id, username, email }
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid token, access denied" });
  }
};