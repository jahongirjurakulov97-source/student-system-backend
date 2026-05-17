const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student", // ✅ Talaba modeliga bog‘ladik
      required: true 
    },
    studentName: { 
      type: String, 
      required: true 
    },
    lessonTitle: { 
      type: String, 
      required: true 
    },
    timeSpent: { 
      type: Number, 
      default: 0 
    }, // sekundda saqlash qulayroq
    testScore: { 
      type: Number, 
      default: 0 
    }, // %
    
    // ⭐ TIKLANGAN MAYDON: Talaba yuklagan amaliyot vazifa faylini saqlash uchun
    fileUrl: {
      type: String,
      default: "" // Agar shunchaki test topshirsa, bu bo'sh qoladi
    },

    status: { 
      type: String, 
      // ⭐ ENUM kengaytirildi: "Vazifa topshirildi" statusi ham qabul qilinishi uchun qo'shildi
      enum: ["Tugallandi", "Jarayonda", "Bekor qilindi", "Vazifa topshirildi"], 
      default: "Tugallandi" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);