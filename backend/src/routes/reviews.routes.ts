import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';
import { createActivity } from '../services/activity.service';
import { notifyUser } from '../services/notification.service';
import { getOrRefreshMedia } from '../services/tmdb.service';

export const reviewsRouter = Router();

reviewsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      tmdbId: z.number().int().positive(),
      type: z.enum(['MOVIE', 'TV', 'movie', 'tv']),
      rating: z.number().int().min(1).max(5),
      content: z.string().min(10).max(5000),
      spoiler: z.boolean().default(false)
    }).parse(req.body);

    const media = await getOrRefreshMedia(body.type, body.tmdbId);
    const review = await prisma.review.upsert({
      where: { userId_mediaId: { userId: req.user!.id, mediaId: media.id } },
      create: { userId: req.user!.id, mediaId: media.id, rating: body.rating, content: body.content, spoiler: body.spoiler },
      update: { rating: body.rating, content: body.content, spoiler: body.spoiler },
      include: { user: { select: { id: true, displayName: true, avatarUrl: true } }, media: true, likes: true, comments: true }
    });

    await createActivity({
      actorId: req.user!.id,
      type: 'REVIEW_CREATED',
      mediaId: media.id,
      reviewId: review.id,
      payload: { rating: body.rating }
    });

    res.status(201).json({ review: { ...review, likesCount: review.likes.length } });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      rating: z.number().int().min(1).max(5).optional(),
      content: z.string().min(10).max(5000).optional(),
      spoiler: z.boolean().optional()
    }).parse(req.body);

    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new HttpError(404, 'Critique introuvable');
    if (review.userId !== req.user!.id) throw new HttpError(403, 'Vous ne pouvez modifier que vos propres critiques');

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: body,
      include: { user: { select: { id: true, displayName: true, avatarUrl: true } }, likes: true, comments: true }
    });
    res.json({ review: { ...updated, likesCount: updated.likes.length } });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new HttpError(404, 'Critique introuvable');
    if (review.userId !== req.user!.id && req.user!.role !== 'ADMIN') throw new HttpError(403, 'Action interdite');

    await prisma.review.delete({ where: { id: review.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!review) throw new HttpError(404, 'Critique introuvable');
    if (review.userId === req.user!.id) throw new HttpError(400, 'Vous ne pouvez pas liker votre propre critique');

    const existing = await prisma.reviewLike.findUnique({ where: { userId_reviewId: { userId: req.user!.id, reviewId: review.id } } });
    if (existing) {
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }

    await prisma.reviewLike.create({ data: { userId: req.user!.id, reviewId: review.id } });
    await notifyUser({
      userId: review.userId,
      type: 'REVIEW_LIKED',
      payload: { reviewId: review.id, byUserId: req.user!.id, byDisplayName: req.user!.displayName }
    });
    res.status(201).json({ liked: true });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({ content: z.string().min(1).max(1500) }).parse(req.body);
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new HttpError(404, 'Critique introuvable');

    const comment = await prisma.reviewComment.create({
      data: { userId: req.user!.id, reviewId: review.id, content: body.content },
      include: { user: { select: { id: true, displayName: true, avatarUrl: true } } }
    });

    if (review.userId !== req.user!.id) {
      await notifyUser({
        userId: review.userId,
        type: 'REVIEW_COMMENTED',
        payload: { reviewId: review.id, commentId: comment.id, byUserId: req.user!.id, byDisplayName: req.user!.displayName }
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
});


reviewsRouter.delete('/comments/:commentId', requireAuth, async (req, res, next) => {
  try {
    const comment = await prisma.reviewComment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) throw new HttpError(404, 'Commentaire introuvable');
    if (comment.userId !== req.user!.id && req.user!.role !== 'ADMIN') throw new HttpError(403, 'Action interdite');
    await prisma.reviewComment.delete({ where: { id: comment.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post('/:id/report', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({ reason: z.string().min(5).max(500) }).parse(req.body);
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new HttpError(404, 'Critique introuvable');
    const report = await prisma.report.create({ data: { reporterId: req.user!.id, reviewId: review.id, reason: body.reason } });
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});
