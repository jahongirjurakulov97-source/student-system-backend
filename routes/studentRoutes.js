const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

/** 
 * --- INTELLEKTUAL TAHLIL FUNKSIYALARI --- 
 */

// 1. Umumiy ballni va bahoni hisoblash
function getSmartGrade(score, testTime, lectureTime, practicalProgress) {
    let timeScore = (lectureTime > 600) ? 30 : (lectureTime > 300 ? 15 : 0);
    let totalIntellect = (score * 0.4) + (practicalProgress * 0.3) + timeScore;

    if (totalIntellect >= 85) return "A+ (Yuqori o'zlashtirish)";
    if (totalIntellect >= 70) return "B (Yaxshi harakat)";
    if (totalIntellect >= 50) return "C (Qoniqarli)";
    return "D (Qayta o'qish tavsiya etiladi)";
}

// 2. Individual tavsiya shakllantirish
function getSmartRecommendation(score, lectureTime) {
    if (score < 50 && lectureTime < 300) {
        return "Materiallarni kam o'rganyapsiz. Ko'proq o'qing 📚";
    }
    if (score >= 90 && lectureTime < 60) {
        return "Natija zo'r, lekin bilimni mustahkamlash uchun amaliyot qiling ⚡";
    }
    return "Ajoyib! Shunday davom eting 🚀";
}

/** 
 * --- API YO'LLARI (ROUTES) --- 
 */

// 1. Barcha talabalarni olish (Ustoz uchun)
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Ma'lumotlarni yuklashda xatolik" });
    }
});

// 2. Bitta talaba ma'lumotini olish (Login qilganda yoki ID orqali)
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: "Talaba topilmadi" });
        res.json(student);
    } catch (err) {
        res.status(404).json({ error: "Talaba topilmadi" });
    }
});

// 3. Yangi talaba qo'shish
router.post("/", async (req, res) => {
    try {
        const { name, score, testTime, lectureTime, practicalProgress, age } = req.body;
        
        const newStudent = new Student({
            name,
            age: age || 20,
            testScore: score || 0,
            testTime: testTime || 0,
            lectureTime: lectureTime || 0,
            practicalProgress: practicalProgress || 0,
            grade: getSmartGrade(score || 0, testTime || 0, lectureTime || 0, practicalProgress || 0),
            recommendation: getSmartRecommendation(score || 0, lectureTime || 0)
        });

        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(500).json({ error: "Saqlashda xato" });
    }
});

/**
 * 4. TALABA HARAKATLARINI YANGILASH (ENG MUHIM QISMI ⚡)
 * Talaba test yechsa yoki dars ko'rsa, shu yo'l chaqiriladi.
 */
router.put("/update-progress/:id", async (req, res) => {
    try {
        const { score, testTime, lectureTime, practicalProgress } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) return res.status(404).json({ error: "Talaba topilmadi" });

        // Yangi ma'lumotlarni eskisiga qo'shish yoki yangilash
        if (score !== undefined) student.testScore = score;
        if (testTime !== undefined) student.testTime += testTime; 
        if (lectureTime !== undefined) student.lectureTime += lectureTime;
        if (practicalProgress !== undefined) student.practicalProgress = practicalProgress;

        // Tahlilni qaytadan hisoblash
        student.grade = getSmartGrade(
            student.testScore, 
            student.testTime, 
            student.lectureTime, 
            student.practicalProgress
        );
        
        student.recommendation = getSmartRecommendation(
            student.testScore, 
            student.lectureTime
        );

        await student.save();
        res.json({ message: "Progress yangilandi!", data: student });
    } catch (err) {
        res.status(500).json({ error: "Yangilashda xato yuz berdi" });
    }
});

/**
 * 5. AMALIY VAZIFA TOPSHIRILGANDA ISHLAYDIGAN YO'L
 * Bu yo'l talaba Student modelida bo'lmasa, avtomatik yaratib ketadi
 */
router.post("/update-practical-progress", async (req, res) => {
    try {
        const { studentId, studentName } = req.body;

        if (!studentId) {
            return res.status(400).json({ error: "studentId topilmadi!" });
        }

        // Student modelidan talabani qidiramiz
        let student = await Student.findById(studentId);

        // Agar talaba hali intellektual modelda yo'q bo'lsa, yangi ochamiz
        if (!student) {
            student = new Student({
                _id: studentId, // User modelidagi ID bilan bir xil qilamiz
                name: studentName || "Talaba",
                age: 23,
                testScore: 0,
                testTime: 0,
                lectureTime: 0,
                practicalProgress: 100 // Vazifa topshirilgani uchun 100% progress
            });
        } else {
            // Agar talaba allaqachon mavjud bo'lsa, amaliyot progressini oshiramiz
            student.practicalProgress = 100;
        }

        // Intellektual baho va tavsiyani qayta hisoblaymiz
        student.grade = getSmartGrade(
            student.testScore, 
            student.testTime, 
            student.lectureTime, 
            student.practicalProgress
        );
        
        student.recommendation = getSmartRecommendation(
            student.testScore, 
            student.lectureTime
        );

        await student.save();
        res.json({ success: true, message: "Amaliyot progressi va intellektual tahlil yangilandi! 🚀", data: student });
    } catch (err) {
        console.error("Progress yangilashda xato:", err);
        res.status(500).json({ error: "Progress yangilashda xatolik yuz berdi", details: err.message });
    }
});

// 6. Talabani o'chirish
router.delete("/:id", async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "O'chirildi" });
    } catch (err) {
        res.status(500).json({ error: "O'chirishda xato" });
    }
});

module.exports = router;