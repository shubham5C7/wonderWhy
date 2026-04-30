const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { pool } = require("../config/db"); // PostgreSQL connection

const signUp = async (req, res) => {
  try {
    // Extract user details from request body
    const { name, email, password } = req.body;

    // Check if user already exists with same email
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Hash password before storing (security best practice)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING  id",
      [name, email, hashedPassword],
    );
    // Send success response with new user ID
    res.json({
      message: "User created",
      userId: result.rows[0].id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    // Extract credentials from request
    const { email, password } = req.body;

    // Fetch user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "User not found" });

    // Compare entered password with hashed password
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ error: "Wrong password" });

    // Generate JWT token (valid for 7 days)
    const token = jwt.sign(
      { id: user.id, name: user.name }, // payload
      process.env.JWT_SECRET, // secret key
      { expiresIn: "7d" }, // expiry
    );
    // Store token in HTTP-only cookie (secure against XSS)
    res.cookie("token", token, {
      httpOnly: true, // JS can't access it — prevents XSS
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "None", // protects against CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
    // Send minimal user info to frontend
    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHECK USER
const checkUser = async (req, res) => {
  try {
    // req.user is assumed to be set by auth middleware (JWT verified)
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id],
    );

    const user = result.rows[0];

    // If user not found in DB
    if (!user) return res.status(404).json({ error: "User not found" });

    // Return basic user info
    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signUp, login, checkUser };
