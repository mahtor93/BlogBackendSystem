import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required.' });
    }

    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }


    req.user = user;


    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export default authenticateToken;
