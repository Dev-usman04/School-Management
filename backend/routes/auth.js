const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "your_jwt_secret");
    res.json({ token, role: user.role, name: user.name, id: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all students (for teachers/admins)
router.get("/students", auth, async (req, res) => {
  // Only allow teachers and admins
  if (!["Teacher", "Admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const students = await User.find({ role: "Student" });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user (admin only)
router.put("/users/:id", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  try {
    const { name, email, role, classId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, classId },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user (admin only)
router.delete("/users/:id", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;