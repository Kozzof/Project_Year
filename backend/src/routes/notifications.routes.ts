import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ notifications, unreadCount: notifications.filter((item) => !item.readAt).length });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.patch('/read/all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!notification) return res.status(404).json({ message: 'Notification introuvable' });
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
    res.json({ notification: updated });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.get('/events', async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    (res as any).flushHeaders?.();

    const interval = setInterval(async () => {
      const unreadCount = await prisma.notification.count({ where: { userId: req.user!.id, readAt: null } });
      res.write(`event: notifications\n`);
      res.write(`data: ${JSON.stringify({ unreadCount })}\n\n`);
    }, 10000);

    req.on('close', () => clearInterval(interval));
  } catch (error) {
    next(error);
  }
});
