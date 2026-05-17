const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Ism kiritilishi shart"] 
  },
  age: { 
    type: Number, 
    default: 20 
  },
  
  // --- Intellektual tahlil maydonlari ---
  testScore: { 
    type: Number, 
    default: 0 
  },         // Test natijasi (%)
  
  testTime: { 
    type: Number, 
    default: 0 
  },          // Testga sarflagan vaqti (sekund)
  
  lectureTime: { 
    type: Number, 
    default: 0 
  },       // Ma'ruza o'qigan vaqti (sekund)
  
  practicalProgress: { 
    type: Number, 
    default: 0 
  }, // Amaliyot bajarish foizi
  
  // Avtomatik baholash natijalari (Backend funksiyasi orqali yangilanadi)
  grade: { 
    type: String, 
    default: "N/A" 
  },
  
  recommendation: { 
    type: String, 
    default: "Tahlil kutilmoqda..." 
  }
}, { timestamps: true });

// Modelni eksport qilish
module.exports = mongoose.model("Student", studentSchema);