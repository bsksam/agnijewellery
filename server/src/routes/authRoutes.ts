import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/authMiddleware.js';
import { dbGet, dbRun } from '../db/connection.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jewel-secret-key-123';

// Login Endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash as string);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Change Password Endpoint
router.post('/change-password', authenticate, async (req: any, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash as string);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

        const newHash = await bcrypt.hash(newPassword, 10);
        await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Verify token route (for initial load)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
