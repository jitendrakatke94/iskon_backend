// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    console.log('token',token);
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
    const decoded = jwt.verify(token, 'ISKON_KEY');
    req.userId = decoded.userId;
    next();
    } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    }
 };

module.exports = verifyToken;