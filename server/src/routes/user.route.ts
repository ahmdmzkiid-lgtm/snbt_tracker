import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { auth } from '../lib/auth.js';

const router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Middleware to check session
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


router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await UserService.getProfile(req.userId!);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await UserService.updateProfile(req.userId!, req.body);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
