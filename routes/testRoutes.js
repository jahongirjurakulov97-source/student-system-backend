const express = require("express");
const router = express.Router();
const multer = require("multer"); // ⭐ Fayl yuklash uchun qo'shildi
const path = require("path");     // ⭐ Fayl kengaytmasini aniqlash uchun qo'shildi

// Modellarni chaqiramiz
const Result = require("../models/Result");
const Student = require("../models/Student");
const Test = require("../models/Test");     
const Lesson = require("../models/Lesson"); 

// ==========================================
// ⭐ MULTER SOZLAMALARI (Fayllarni qabul qilish uchun)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Fayllar 'uploads' papkasiga saqlanadi
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unikal nom berish
  }
});
const upload = multer({ storage: storage });


// ==========================================
// 1. ADMIN (TEACHER) QISMI
// ==========================================

// Test yaratish va bazaga saqlash
router.post("/create", async (req, res) => {
  try {
    const { lessonTitle, questions, duration } = req.body;

    const newTest = new Test({
      title: lessonTitle,
      questions: questions,
      duration: duration || 30 
    });

    await newTest.save();
    res.json({ message: "Test yaratildi va bazaga saqlandi ✅", test: newTest });
  } catch (err) {
    res.status(500).json({ error: "Test yaratishda xato ❌", details: err.message });
  }
});

// Maruza yoki Amaliyot yuklash
router.post("/upload-lesson", async (req, res) => {
  try {
    const { title, content, type } = req.body; 

    const newLesson = new Lesson({
      title,
      content,
      type
    });

    await newLesson.save();
    res.json({ message: "Dars (maruza/amaliyot) muvaffaqiyatli yuklandi ✅", lesson: newLesson });
  } catch (err) {
    res.status(500).json({ error: "Yuklashda xato ❌", details: err.message });
  }
});

// Barcha talabalar natijalarini ko'rish (Umumiy ro'yxat)
router.get("/all-results", async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json({ message: "Barcha test natijalari", results });
  } catch (err) {
    res.status(500).json({ error: "Ma'lumotlarni olishda xato ❌" });
  }
});

// Admin panelda eski testni ID orqali o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const testId = req.params.id;
    const deletedTest = await Test.findByIdAndDelete(testId);

    if (!deletedTest) {
      return res.status(404).json({ error: "O'chirilishi kerak bo'lgan test topilmadi ❌" });
    }

    res.json({ message: "Test muvaffaqiyatli o'chirildi ✅", test: deletedTest });
  } catch (err) {
    res.status(500).json({ error: "Testni o'chirishda xatolik yuz berdi ❌", details: err.message });
  }
});

// Talabaning eski test natijasini o'chirish funksiyasi
router.delete("/result/:id", async (req, res) => {
  try {
    const resultId = req.params.id;
    const deletedResult = await Result.findByIdAndDelete(resultId);

    if (!deletedResult) {
      return res.status(404).json({ error: "O'chirilishi kerak bo'lgan talaba natijasi topilmadi ❌" });
    }

    res.json({ message: "Talaba natijasi muvaffaqiyatli o'chirildi ✅", result: deletedResult });
  } catch (err) {
    console.error("Natijani o'chirishda xato:", err);
    res.status(500).json({ error: "Natijani o'chirishda xatolik yuz berdi ❌", details: err.message });
  }
});


// ==========================================
// 2. TALABA (STUDENT) QISMI
// ==========================================

// Barcha testlarni ko'rish
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: "Testlarni yuklashda xato ❌", details: err.message });
  }
});

// Bitta testni ID orqali olish
router.get("/single/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: "Test topilmadi ❌" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: "Testni yuklashda xato ❌", details: err.message });
  }
});

// =====================================================================
// ⭐ TO'G'RILANDI: ULTRA-XAVFSIZ VA DESTUCTURE XATOSIZ SUBMIT YO'LI
// =====================================================================
router.post("/submit", upload.single("file"), async (req, res) => {
  try {
    // req.body borligini tekshiramiz, bo'lmasa dastur qulamasligi uchun bo'sh obyekt beramiz
    const bodyData = req.body || {};

    const studentId = bodyData.studentId;
    const studentName = bodyData.studentName || "Noma'lum Talaba";
    const lessonTitle = bodyData.lessonTitle || "Amaliy dars";
    const timeSpent = bodyData.timeSpent;
    const testScore = bodyData.testScore;

    // Agar studentId kelmagan bo'lsa, xavfsiz xatolik qaytaramiz (500 bo'lib qulamaydi)
    if (!studentId) {
      return res.status(400).json({ 
        error: "studentId topilmadi! ❌", 
        details: "Frontenddan talaba ID-si backendga yetib kelmadi yoki o'qib bo'lmadi." 
      });
    }

    // Agar talaba amaliyot topshirgan bo'lsa fayl nomi keladi, aks holda bo'sh bo'ladi
    const fileUrl = req.file ? req.file.filename : "";
    
    // Statusni aniqlash
    const currentStatus = fileUrl ? "Vazifa topshirildi" : "Tugallandi";

    // 1. Natijani yaratish va saqlash
    const result = new Result({
      studentId,
      studentName,
      lessonTitle,
      timeSpent: Number(timeSpent) || 0, 
      testScore: Number(testScore) || 0,
      fileUrl, 
      status: currentStatus
    });
    await result.save();

    // 2. Baho va tavsiya mantiqi
    let grade = testScore >= 80 ? "A" : testScore >= 60 ? "B" : "C";
    let recommendation = testScore < 60 ? "Mavzuni qayta o'zlashtirish tavsiya etiladi" : "Siz mavzuni a'lo darajada o'zlashtirdingiz!";

    // 3. Talaba ma'lumotlarini yangilash (Xavfsiz try-catch ichida)
    if (studentId && studentId.length === 24) { 
        try {
            await Student.findByIdAndUpdate(studentId, { 
              grade, 
              recommendation 
            });
        } catch (studentErr) {
            console.log("Student modelini yangilashda xato (lekin vazifa saqlandi):", studentErr.message);
        }
    }

    res.json({ 
      success: true,
      message: "Natija va vazifa muvaffaqiyatli qabul qilindi ✅", 
      score: testScore + "%", 
      grade, 
      recommendation,
      fileUrl
    });
  } catch (err) {
    console.error("Backend saqlashda xato:", err);
    res.status(500).json({ error: "Natijani saqlashda xato ❌", details: err.message });
  }
});

// Talaba o'zining darslarini ko'rishi
router.get("/lessons", async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: "Darslarni yuklashda xato ❌" });
  }
});

// Talaba o'zining barcha natijalarini ko'rishi
router.get("/my-activity/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await Result.find({ studentId }).sort({ createdAt: -1 });
    res.json({ message: "Sizning faoliyatingiz", results });
  } catch (err) {
    res.status(500).json({ error: "Ma'lumot topilmadi ❌" });
  }
});

module.exports = router;