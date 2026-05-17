const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// --- Lecture modeli ---
const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },       // Ma’ruza nomi
    description: { type: String },                 // Izoh
    fileUrl: { type: String, required: true },     // Fayl manzili (PDF/video link)
    uploadedBy: { type: String, default: "Admin" } // Yuklagan shaxs
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

// --- ROUTES ---

// 1. Admin: Ma’ruza yuklash
router.post("/upload", async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;

    const newLecture = new Lecture({ title, description, fileUrl });
    await newLecture.save();

    res.status(201).json({ message: "Ma’ruza yuklandi ✅", lecture: newLecture });
  } catch (err) {
    res.status(500).json({ error: "Ma’ruza yuklashda xato ❌", details: err.message });
  }
});

// 2. Talaba: Barcha ma’ruzalarni ko‘rish
router.get("/", async (req, res) => {
  try {
    const lectures = await Lecture.find().sort({ createdAt: -1 });
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ error: "Ma’ruzalarni olishda xato ❌", details: err.message });
  }
});

// 3. Talaba: Bitta ma’ruzani ko‘rish
router.get("/:id", async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ error: "Ma’ruza topilmadi ❌" });
    res.json(lecture);
  } catch (err) {
    res.status(500).json({ error: "Ma’ruza olishda xato ❌", details: err.message });
  }
});

// 4. Admin: Ma’ruza o‘chirish
router.delete("/:id", async (req, res) => {
  try {
    await Lecture.findByIdAndDelete(req.params.id);
    res.json({ message: "Ma’ruza o‘chirildi ✅" });
  } catch (err) {
    res.status(500).json({ error: "O‘chirishda xato ❌", details: err.message });
  }
});

module.exports = router;
