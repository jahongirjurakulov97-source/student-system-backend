const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    enum: ["maruza", "amaliyot"],
    default: "maruza",
  },

  fileUrl: {
    type: String,
    default: "",
  },

  teacher: {
    type: String,
    default: "Admin",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lesson", lessonSchema);