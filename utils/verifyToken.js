import jwt from 'jsonwebtoken';

export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.astrologerId; // Ensure astrologerId is stored in token payload
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}
