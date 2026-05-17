// 1. Node v18+ uchun CRYPTO xatosini tuzatish
const crypto = require("crypto");

if (!global.crypto) {
  global.crypto = crypto;
}

if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = (buffer) =>
    crypto.randomFillSync(buffer);
}

if (!global.crypto.subtle) {
  global.crypto.subtle = crypto.webcrypto.subtle;
}

// 2. ENV
require("dotenv").config();

// 3. Paketlar
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 4. Route importlar qismiga buni qo'shing:
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const lessonRoutes = require("./routes/lessonRoutes"); // <-- MANA BU IMPORT ETISHMAYOTGAN EDI

// 5. Model
const Lesson = require("./models/Lesson");

const app = express();

// 6. Middleware
app.use(cors());
app.use(express.json());

// 7. 'uploads' papkasi borligini tekshirish (yo'q bo'lsa yaratadi, xato bermasligi uchun)
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// uploads papkani ochish (Fayllarni brauzerda ko'rish uchun)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 8. MongoDB
const MONGO_URI =
  "mongodb+srv://jahongirjurakulov9_db_user:12345678j@cluster0.73j6adh.mongodb.net/student_system?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() =>
    console.log("Tabriklayman! MongoDB muvaffaqiyatli ulandi ✅")
  )
  .catch((err) => {
    console.log("Mongo ulanishda xato yuz berdi ❌");
    console.log("Xato matni:", err.message);
  });

// 9. Multer storage sozlamalari
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 10. Home route
app.get("/", (req, res) => {
  res.send("Backend server ishlayapti! 🚀");
});

// 11. API routes qismini quyidagicha to'g'rilang:
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/lessons", lessonRoutes); 

// <-- APPNI ROUTER BILAN BOG'LASH

// =====================================================
// LESSON UPLOAD API (Ma'ruza yuklash)
// =====================================================

app.post(
  "/api/lessons/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Fayl tanlanmagan!" });
      }

      // Model maydonlari bilan moslashtirildi:
      const lesson = new Lesson({
        title: req.body.title || req.body.topic, // Ham title, ham topic kelishiga tayyorlandi
        teacher: req.body.teacher || "Admin",
        fileUrl: req.file.filename, // Modelda fileUrl edi, req.file.filename deb yozdik
        type: "maruza"
      });

      await lesson.save();

      res.json({
        success: true,
        message: "Ma'ruza saqlandi ✅",
      });
    } catch (err) {
      console.log("Yuklashda xato:", err);
      res.status(500).json({
        success: false,
        error: "Serverda faylni saqlashda xato yuz berdi",
      });
    }
  }
);

// =====================================================
// LESSON GET API (Ma'ruzalarni olish)
// =====================================================

app.get("/api/lessons", async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({
      _id: -1,
    });

    res.json(lessons);
  } catch (err) {
    console.log("Olishda xato:", err);
    res.status(500).json({
      success: false,
      error: "Lessonlarni olishda xato",
    });
  }
});

// 12. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi 🚀`);
  console.log(`Lokal manzil: http://localhost:${PORT}`);
  console.log(`====================================\n`);
});