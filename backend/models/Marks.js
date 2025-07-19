const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  marks: { type: Number, required: true },
  feedback: { type: String },
});

module.exports = mongoose.model("Marks", marksSchema);