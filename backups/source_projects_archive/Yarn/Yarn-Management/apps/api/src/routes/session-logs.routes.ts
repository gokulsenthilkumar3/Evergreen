import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// GET /api/session-logs - Get session logs for current user (or all for admin)
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { page = 1, limit = 20, all = 'false' } = req.query;
        const currentRefreshToken = req.cookies?.refresh_token;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        // For now, users can only see their own sessions
        // Admin can see all with ?all=true
        const where = all === 'true'
            ? {}
            : { userId };

        const [sessions, total] = await Promise.all([
            prisma.sessionLog.findMany({
                where,
                orderBy: { loginAt: 'desc' },
                skip,
                take,
                include: {
                    user: {
                        select: { id: true, email: true, name: true },
                    },
                },
            }),
            prisma.sessionLog.count({ where }),
        ]);

        // Identify current session
        const sessionsWithStatus = await Promise.all(sessions.map(async (s) => {
            let isCurrent = false;
            if (currentRefreshToken && s.sessionToken && s.isActive) {
                // Warning: bcrypt compare on every row can be slow if limit is high.
                // Limit is 20, acceptable.
                isCurrent = await bcrypt.compare(currentRefreshToken, s.sessionToken);
            }
            return {
                ...s,
                isCurrent
            };
        }));

        res.json({
            data: sessionsWithStatus,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching session logs:', error);
        res.status(500).json({ error: 'Failed to fetch session logs' });
    }
});

// GET /api/session-logs/:id - Get specific session
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const session = await prisma.sessionLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
                revoker: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Users can only view their own sessions
        if (session.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(session);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// DELETE /api/session-logs/:id - Revoke a session
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const session = await prisma.sessionLog.findUnique({
            where: { id },
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Users can only revoke their own sessions
        if (session.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Mark session as revoked
        await prisma.sessionLog.update({
            where: { id },
            data: {
                isActive: false,
                revokedAt: new Date(),
                revokedBy: userId,
                logoutAt: new Date(),
            },
        });

        // Also invalidate any refresh tokens for this session if stored
        if (session.sessionToken) {
            await prisma.refreshToken.deleteMany({
                where: { tokenHash: session.sessionToken },
            });
        }

        res.json({ success: true, message: 'Session revoked successfully' });
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({ error: 'Failed to revoke session' });
    }
});

// POST /api/session-logs - Create a new session log (called by auth service)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, deviceInfo, ipAddress, location, sessionToken } = req.body;

        if (!userId || !deviceInfo || !ipAddress) {
            return res.status(400).json({ error: 'userId, deviceInfo, and ipAddress are required' });
        }

        const session = await prisma.sessionLog.create({
            data: {
                userId,
                deviceInfo,
                ipAddress,
                location,
                sessionToken,
                isActive: true,
            },
        });

        res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session log:', error);
        res.status(500).json({ error: 'Failed to create session log' });
    }
});

// PUT /api/session-logs/:id/logout - Mark session as logged out
router.put('/:id/logout', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const session = await prisma.sessionLog.update({
            where: { id },
            data: {
                isActive: false,
                logoutAt: new Date(),
            },
        });

        res.json(session);
    } catch (error) {
        console.error('Error logging out session:', error);
        res.status(500).json({ error: 'Failed to log out session' });
    }
});

// GET /api/session-logs/active - Get active sessions count
router.get('/stats/active', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        const activeCount = await prisma.sessionLog.count({
            where: {
                userId,
                isActive: true,
            },
        });

        const totalCount = await prisma.sessionLog.count({
            where: { userId },
        });

        res.json({
            active: activeCount,
            total: totalCount,
        });
    } catch (error) {
        console.error('Error fetching session stats:', error);
        res.status(500).json({ error: 'Failed to fetch session stats' });
    }
});

export default router;
