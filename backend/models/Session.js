const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
