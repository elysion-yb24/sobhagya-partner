// pages/api/astrologer/verify-and-register.js

import dbConnect from '@/config/db';
import Astrologer from '@/models/astrologer';
import OTP from '@/models/otp';
import Session from '@/models/session';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, phone, otp } = req.body;

    // Validate inputs
    if (!otp || !phone || !name) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    try {
      // Verify OTP
      const otpRecord = await OTP.findOne({
        phone,
        otp,
        expiresAt: { $gt: new Date() },
      });
      if (!otpRecord) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Check if the user is already registered
      const existingUser = await Astrologer.findOne({ phone });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: 'Phone number already registered' });
      }

      // Create a new astrologer
      const newAstrologer = new Astrologer({
        name,
        phone,
        isVerified: true,
      });
      await newAstrologer.save();

      // Delete the OTP record after successful registration
      await OTP.deleteMany({ phone });

      // --- Generate JWT token ---
      const token = jwt.sign(
        { astrologerId: newAstrologer._id },
        process.env.JWT_SECRET, // Use your actual secret key
        { expiresIn: '1d' } // Token expires in 1 day
      );

      // --- Save session in the database ---
      const session = new Session({
        astrologerId: newAstrologer._id,
        authToken: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1-day expiry
      });
      await session.save();

      // --- Send JWT token as HttpOnly cookie ---
      res.setHeader(
        'Set-Cookie',
        `token=${token}; HttpOnly; Path=/; Max-Age=86400; Secure; SameSite=Strict`
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully. JWT token generated.',
        astrologer: newAstrologer,
      });
    } catch (error) {
      console.error('Error in OTP verification or user registration:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Server error', error: error.message });
    }
  } else {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }
}
