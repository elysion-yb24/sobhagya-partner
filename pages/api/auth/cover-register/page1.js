import dbConnect from "@/config/db";
import Astrologer from '@/models/astrologer';
import OTP from "@/models/otp";

export default async function handler(req, res) {
  await dbConnect();
  console.log('Database connected successfully');

  if (req.method === 'POST') {
    const { name, phone } = req.body;

    // Validate the inputs
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }

    try {
      // Check if phone number already exists
      const existingUser = await Astrologer.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Phone number already registered.' });
      }

      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      console.log("Generated OTP:", otp);

      // Remove any existing OTP for this phone
      await OTP.deleteMany({ phone });

      // Save OTP in the OTP model
      await OTP.create({
        phone,
        otp,
        expiresAt,
      });

      console.log("OTP stored successfully.");

      // Send OTP via your preferred SMS service here (pseudo-code)
      // await sendSms(phone, `Your OTP is ${otp}`);

      return res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
      console.error('Error in handler:', error);
      return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }
}
