import mongoose from 'mongoose';
import Astrologer from '@/models/astrologer';
import { verifyToken } from '@/utils/verifyToken';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        
        // Extract JWT token from cookies
        
        const token = req.cookies?.token;  // Ensure cookies are correctly read
        if (!token) {
            
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Verify the token and extract astrologer ID
        
        const astrologerId = verifyToken(token);
        if (!astrologerId) { 
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        

        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
           
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        // Fetch astrologer details from DB
        
        const astrologer = await Astrologer.findById(astrologerId);

        if (!astrologer) {
            
            return res.status(404).json({ success: false, error: 'Astrologer not found' });
        }

        
        return res.status(200).json({ success: true, interviewStatus: astrologer.interviewStatus });
    } catch (error) {
        
        return res.status(500).json({ success: false, error: 'Server error' });
    }
}
