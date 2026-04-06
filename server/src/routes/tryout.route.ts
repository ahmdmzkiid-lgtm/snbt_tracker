import { Router, Request, Response, NextFunction } from 'express';
import { TryoutService } from '../services/tryout.service.js';
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
    const tryouts = await TryoutService.getTryouts(req.userId!);
    res.json(tryouts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tryout = await TryoutService.addTryout(req.userId!, req.body);
    res.json(tryout);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await TryoutService.deleteTryout(req.userId!, parseInt(req.params.id as string));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
