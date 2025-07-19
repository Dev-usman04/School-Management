const express = require("express");
const Marks = require("../models/Marks");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "Teacher") return res.status(403).json({ error: "Teachers only" });
  try {
    const marks = new Marks(req.body);
    await marks.save();
    // Emit Socket.IO event
    const io = req.app.get("io");
    io.emit("newMark", { studentId: req.body.studentId, marks: req.body.marks });
    res.status(201).json(marks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/student/:studentId", auth, async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId }).populate("classId");
    res.json(marks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;