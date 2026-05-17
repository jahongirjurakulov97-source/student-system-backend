const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  }, // Testning nomi (masalan: "React asoslari")
  
  questions: [
    {
      questionText: { type: String, required: true }, // Savol matni
      options: [{ type: String, required: true }],    // 4 ta javob varianti (massiv)
      correctAnswer: { type: String, required: true } // To'g'ri javob matni
    }
  ],
  
  duration: { 
    type: Number, 
    default: 30 
  }, // Test uchun berilgan vaqt (minutda)
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Test", testSchema);