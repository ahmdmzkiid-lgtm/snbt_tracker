import { Router, Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service.js';
import { auth } from '../lib/auth.js';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({ 
    headers: new Headers(Object.entries(req.headers)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v as string]))
  });
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  (req as AuthRequest).userId = session.user.id;
  next();
};




router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await SessionService.getSessions(req.userId!);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const session = await SessionService.addSession(req.userId!, req.body);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
