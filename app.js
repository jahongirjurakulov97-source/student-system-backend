require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB ulandi ✅"))
  .catch((err) => console.log("Mongo error:", err));

function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

function getRecommendation(score) {
  if (score < 50) return "Ko‘proq o‘qish kerak 📚";
  if (score < 70) return "Yaxshi, lekin yana ishlash kerak ⚡";
  if (score < 90) return "Zo‘r! Yana ozgina harakat qiling 🚀";
  return "Mukammal! 🔥";
}

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  score: { type: Number, required: true },
  grade: String,
  recommendation: String
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

app.post("/api/students", async (req, res) => {
  try {
    const { name, age, score } = req.body;

    if (!name || !age || score === undefined) {
      return res.status(400).json({ error: "Ma'lumot to‘liq emas ❌" });
    }

    const newStudent = new Student({
      name,
      age,
      score,
      grade: getGrade(score),
      recommendation: getRecommendation(score)
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: "Server xatosi ❌" });
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Xato ❌" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server ishladi 🚀");
});