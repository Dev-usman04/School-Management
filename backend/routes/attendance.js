const express = require("express");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "Teacher") return res.status(403).json({ error: "Teachers only" });
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/student/:studentId", auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId }).populate("classId");
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;