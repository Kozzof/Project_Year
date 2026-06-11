import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';
import { serializeMedia } from '../services/tmdb.service';

export const feedRouter = Router();
feedRouter.use(requireAuth);

feedRouter.get('/', async (req, res, next) => {
  try {
    const follows = await prisma.follow.findMany({ where: { followerId: req.user!.id }, select: { followingId: true } });
    const actorIds = follows.map((follow) => follow.followingId);

    const activities = await prisma.activity.findMany({
      where: { actorId: { in: actorIds } },
      include: {
        actor: { select: { id: true, displayName: true, avatarUrl: true } },
        media: true,
        review: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ activities: activities.map((activity) => ({ ...activity, media: activity.media ? serializeMedia(activity.media) : null })) });
  } catch (error) {
    next(error);
  }
});
