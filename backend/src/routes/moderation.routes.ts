import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAdmin, requireAuth } from '../middlewares/auth';

export const moderationRouter = Router();
moderationRouter.use(requireAuth, requireAdmin);

moderationRouter.get('/reports', async (_req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, displayName: true } },
        review: { include: { user: { select: { id: true, displayName: true } }, media: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

moderationRouter.patch('/reports/:id', async (req, res, next) => {
  try {
    const body = z.object({ status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']) }).parse(req.body);
    const report = await prisma.report.update({ where: { id: req.params.id }, data: { status: body.status } });
    res.json({ report });
  } catch (error) {
    next(error);
  }
});

moderationRouter.patch('/reviews/:id/highlight', async (req, res, next) => {
  try {
    const body = z.object({ highlighted: z.boolean() }).parse(req.body);
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { highlighted: body.highlighted } });
    res.json({ review });
  } catch (error) {
    next(error);
  }
});

moderationRouter.delete('/reviews/:id', async (req, res, next) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

moderationRouter.patch('/users/:id/ban', async (req, res, next) => {
  try {
    const body = z.object({ banned: z.boolean() }).parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { banned: body.banned, tokenVersion: { increment: 1 } } });
    res.json({ user: { id: user.id, displayName: user.displayName, banned: user.banned } });
  } catch (error) {
    next(error);
  }
});
