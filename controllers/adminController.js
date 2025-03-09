import Admin from '../models/adminModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    const admin = new Admin({
      email,
      password,
      name
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin creation failed',
      error: error.message
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

export const verifyAdmin = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};