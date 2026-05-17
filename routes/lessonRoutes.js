const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Lesson = require("../models/Lesson");

// Fayllarni saqlash sozlamasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 1. Ma'ruza VA Amaliyot yuklash yo'li (POST): http://localhost:5000/api/lessons/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, topic, content, type, teacher } = req.body;

    const newLesson = new Lesson({
      title: title || topic,                       // Frontenddan qaysi biri kelsa ham qabul qiladi
      content: content || "",                      // Amaliyot topshiriq matni uchun
      fileUrl: req.file ? req.file.filename : "",  // Fayl bo'lsa nomini saqlaydi, bo'lmasa bo'sh qoldiradi
      teacher: teacher || "Admin",
      type: type || "maruza"                       // Frontenddan kelgan type ("maruza" yoki "amaliyot") saqlanadi
    });

    await newLesson.save();
    res.status(201).json({ success: true, message: "Muvaffaqiyatli saqlandi! ✅" });
  } catch (err) {
    console.error("Vazifa saqlashda xato:", err);
    res.status(500).json({ success: false, error: "Serverda saqlashda xato yuz berdi" });
  }
});

// 2. Barcha dars va amaliyotlarni olish (GET): http://localhost:5000/api/lessons
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ success: false, message: "Ma'lumotlarni olishda xato" });
  }
});

// ==========================================
// YANGA QO'SHILGAN QISM: MA'RUZA VA AMALIYOTNI O'CHIRISH (DELETE)
// Manzil: http://localhost:5000/api/lessons/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Bazadan ID orqali qidirib o'chirish
    const deletedLesson = await Lesson.findByIdAndDelete(id);

    if (!deletedLesson) {
      return res.status(404).json({ success: false, message: "O'chiriladigan ma'lumot topilmadi!" });
    }

    res.json({ success: true, message: "Muvaffaqiyatli o'chirildi! ✅" });
  } catch (err) {
    console.error("O'chirishda xatolik:", err);
    res.status(500).json({ success: false, message: "Serverda o'chirishda xatolik yuz berdi" });
  }
});

module.exports = router;