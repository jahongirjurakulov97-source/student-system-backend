const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTRATSIYA
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Kiritilgan ma'lumotlar borligini tekshirish
    if (!username || !password) {
      return res.status(400).json({ error: "Username va parolni kiriting!" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Bu username band!" });
    }

    // Parolni xeshlash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, role: role || 'student' });
    const savedUser = await newUser.save();

    // Frontend (React) xatolik bermay to'g'ri qabul qilishi uchun tuzatilgan qism:
    res.status(201).json({ 
      message: "Foydalanuvchi yaratildi ✅", 
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Serverda xatolik ❌", details: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Username topilmadi ❌" });
    }

    // Parolni solishtirish
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Parol xato ❌" });
    }

    // JWT token yaratish
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "1h" }
    );

    // React kodingizdagi "setUser(data)" qismi muammosiz ishlashi uchun ob'ekt ko'rinishi
    res.json({ 
      message: "Login muvaffaqiyatli ✅", 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Serverda xatolik ❌", details: err.message });
  }
});

module.exports = router;