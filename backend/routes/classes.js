const express = require("express");
const Class = require("../models/Class");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "Admin") return res.status(403).json({ error: "Admins only" });
  try {
    // Accept date and time from the request body
    const { name, subject, teacherId, date, time } = req.body;
    const classData = new Class({
      name,
      subject,
      teacherId,
      date: date ? new Date(date) : undefined,
      time
    });
    await classData.save();
    res.status(201).json(classData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    // Always return date and time fields
    const classes = await Class.find().populate("teacherId", "name");
    res.json(classes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;