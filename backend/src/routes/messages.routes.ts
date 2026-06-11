import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

async function assertMutualFollow(userA: string, userB: string) {
  const [aFollowsB, bFollowsA] = await Promise.all([
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userA, followingId: userB } } }),
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userB, followingId: userA } } })
  ]);
  if (!aFollowsB || !bFollowsA) throw new HttpError(403, 'La messagerie est réservée aux utilisateurs qui se suivent mutuellement');
}

messagesRouter.get('/:userId', async (req, res, next) => {
  try {
    await assertMutualFollow(req.user!.id, req.params.userId);
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: req.user!.id, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.user!.id }
        ]
      },
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true } },
        receiver: { select: { id: true, displayName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    });
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

messagesRouter.post('/:userId', async (req, res, next) => {
  try {
    const body = z.object({ content: z.string().min(1).max(2000) }).parse(req.body);
    await assertMutualFollow(req.user!.id, req.params.userId);
    const message = await prisma.directMessage.create({
      data: { senderId: req.user!.id, receiverId: req.params.userId, content: body.content },
      include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } }
    });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});
