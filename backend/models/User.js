// Mongoose is used to define schemas and interact with 
// MongoDB. It helps us structure user data before storing it in the database
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["Teacher", "Student"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
