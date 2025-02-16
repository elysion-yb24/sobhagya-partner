// pages/api/astrologer/fill-details.js

import dbConnect from '@/config/db';
import Astrologer from '@/models/astrologer';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { phone, yoe, languages, astrologerTypes } = req.body;

    // Validate inputs
    if (!phone || !yoe || !languages?.length || !astrologerTypes?.length) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    try {
      // Check if the astrologer exists
      const astrologer = await Astrologer.findOne({ phone });
      if (!astrologer) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'User not found. Complete earlier steps first.',
          });
      }

      // Update astrologer details
      astrologer.yearsOfExperience = yoe;
      astrologer.languages = languages; // multiple languages
      astrologer.specializations = astrologerTypes; // multiple specializations
      astrologer.isDetailsFilled = true;
      await astrologer.save();

      return res.status(200).json({
        success: true,
        message: 'Details updated successfully.',
      });
    } catch (error) {
      console.error('Error in filling details:', error);
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
