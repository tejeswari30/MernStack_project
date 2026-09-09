const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
    },

    // 🔥 Link answer to specific question
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Answer", answerSchema);