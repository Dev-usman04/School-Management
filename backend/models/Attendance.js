const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { type: Date, default: Date.now },
  present: { type: Boolean, required: true },
});

module.exports = mongoose.model("Attendance", attendanceSchema);