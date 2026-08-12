import express from "express";
import { pool } from "../Config/db.js";
import isEmail from "validator/lib/isEmail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../Utils/mailer.js"; // ad

const salt_rounds = 10;

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter username, email and password",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be six characters long",
    });
  }

  if (!isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Email Detected",
    });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR username = $2`,
      [email, username],
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, salt_rounds);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username`,
      [username, email, hashedPassword],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email }, // ✅ to this
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    const COOKIE_OPTIONS = {
      httpOnly: true, // JS can't read it — blocks XSS token theft
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" if frontend/backend are different domains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN
    };

    // inside signup, after creating the token:
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user, // no token in the body anymore
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong during signup" });
  }
};

export default signup;

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email and password",
    });
  }

  if (!isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Email Detected",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash FROM users WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email }, // ✅ to this
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    // inside login, after creating the token:
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong during login" });
  }
};

// ---------------- FORGOT PASSWORD ----------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email FROM users WHERE email = $1`,
      [email],
    );

    // Respond the same way whether or not the user exists,
    // so attackers can't use this to enumerate registered emails
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, a reset link has been sent",
      });
    }

    const user = result.rows[0];

    // Generate a raw token to email, and a hashed version to store
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `UPDATE users
       SET reset_token = $1, reset_token_expires = $2
       WHERE id = $3`,
      [hashedToken, expiresAt, user.id],
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.username},</p>
        <p>You requested a password reset. Click the link below to reset it. This link expires in 1 hour.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent",
    });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ---------------- RESET PASSWORD ----------------
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Reset token is required" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be six characters long",
    });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      `SELECT id FROM users
       WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [hashedToken],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, salt_rounds);

    await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
       WHERE id = $2`,
      [hashedPassword, user.id],
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
