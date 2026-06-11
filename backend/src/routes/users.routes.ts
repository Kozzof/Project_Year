import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';
import { createActivity } from '../services/activity.service';
import { notifyUser } from '../services/notification.service';
import { serializeMedia } from '../services/tmdb.service';

export const usersRouter = Router();

const publicUserSelect = {
  id: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  website: true,
  createdAt: true
};

usersRouter.get('/search', async (req, res, next) => {
  try {
    const q = z.string().min(1).parse(req.query.q);
    const users = await prisma.user.findMany({
      where: {
        banned: false,
        OR: [
          { displayName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: publicUserSelect,
      take: 20
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      displayName: z.string().min(2).max(60).optional(),
      avatarUrl: z.string().url().nullable().optional(),
      bio: z.string().max(500).nullable().optional(),
      website: z.string().url().nullable().optional(),
      theme: z.enum(['light', 'dark']).optional(),
      language: z.enum(['fr', 'en']).optional()
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: body,
      select: { ...publicUserSelect, email: true, role: true, theme: true, language: true }
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/me/export', requireAuth, async (req, res, next) => {
  try {
    const format = z.enum(['json', 'csv']).default('json').parse(req.query.format ?? 'json');
    const reviews = await prisma.review.findMany({ where: { userId: req.user!.id }, include: { media: true }, orderBy: { createdAt: 'desc' } });
    const rows = reviews.map((review) => ({
      media: review.media.title,
      type: review.media.type,
      tmdbId: review.media.tmdbId,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString()
    }));

    if (format === 'csv') {
      const header = 'media,type,tmdbId,rating,content,createdAt';
      const csv = [header, ...rows.map((row) => [row.media, row.type, row.tmdbId, row.rating, row.content, row.createdAt].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
      res.setHeader('content-type', 'text/csv; charset=utf-8');
      res.setHeader('content-disposition', 'attachment; filename="supcontent-export.csv"');
      return res.send(csv);
    }

    res.json({ reviews: rows });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: publicUserSelect
    });
    if (!user) throw new HttpError(404, 'Utilisateur introuvable');

    const [followersCount, followingCount, followers, following, reviews, publicLists] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.follow.findMany({
        where: { followingId: user.id },
        include: { follower: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.follow.findMany({
        where: { followerId: user.id },
        include: { following: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.review.findMany({
        where: { userId: user.id },
        include: { media: true, likes: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.customList.findMany({
        where: { userId: user.id, isPublic: true },
        include: { items: { include: { media: true } } },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    res.json({
      user,
      stats: { followersCount, followingCount },
      followers: followers.map((follow) => follow.follower),
      following: following.map((follow) => follow.following),
      reviews: reviews.map((review) => ({ ...review, media: serializeMedia(review.media), likesCount: review.likes.length })),
      publicLists: publicLists.map((list) => ({ ...list, items: list.items.map((item) => ({ ...item, media: serializeMedia(item.media) })) }))
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    const followingId = req.params.id;
    if (followingId === req.user!.id) throw new HttpError(400, 'Vous ne pouvez pas vous suivre vous-même');

    const target = await prisma.user.findUnique({ where: { id: followingId } });
    if (!target || target.banned) throw new HttpError(404, 'Utilisateur introuvable');

    const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: req.user!.id, followingId } } });
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    }

    await prisma.follow.create({ data: { followerId: req.user!.id, followingId } });
    await createActivity({ actorId: req.user!.id, type: 'FOLLOW_CREATED', payload: { followingId } });
    await notifyUser({ userId: followingId, type: 'NEW_FOLLOWER', payload: { followerId: req.user!.id, followerName: req.user!.displayName } });
    res.status(201).json({ following: true });
  } catch (error) {
    next(error);
  }
});
