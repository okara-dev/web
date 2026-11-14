const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Bitte authentifizieren Sie sich' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Bitte authentifizieren Sie sich' });
    }
};

module.exports = auth;