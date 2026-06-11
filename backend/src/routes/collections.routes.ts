import { Router } from 'express';
import { CollectionStatus } from '@prisma/client';
import { z } from 'zod';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';
import { createActivity } from '../services/activity.service';
import { getOrRefreshMedia, serializeMedia } from '../services/tmdb.service';

export const collectionsRouter = Router();
collectionsRouter.use(requireAuth);

const statusSchema = z.nativeEnum(CollectionStatus);

collectionsRouter.get('/me/library', async (req, res, next) => {
  try {
    const query = z.object({ status: statusSchema.optional() }).parse(req.query);
    const entries = await prisma.collectionEntry.findMany({
      where: { userId: req.user!.id, status: query.status },
      include: { media: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ entries: entries.map((entry) => ({ ...entry, media: serializeMedia(entry.media) })) });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.post('/me/library', async (req, res, next) => {
  try {
    const body = z.object({
      tmdbId: z.number().int().positive(),
      type: z.enum(['MOVIE', 'TV', 'movie', 'tv']),
      status: statusSchema
    }).parse(req.body);

    const media = await getOrRefreshMedia(body.type, body.tmdbId);
    const entry = await prisma.collectionEntry.upsert({
      where: { userId_mediaId: { userId: req.user!.id, mediaId: media.id } },
      create: { userId: req.user!.id, mediaId: media.id, status: body.status },
      update: { status: body.status },
      include: { media: true }
    });

    await createActivity({
      actorId: req.user!.id,
      type: 'MEDIA_ADDED_TO_COLLECTION',
      mediaId: media.id,
      payload: { status: body.status }
    });

    res.json({ entry: { ...entry, media: serializeMedia(entry.media) } });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.delete('/me/library/:mediaId', async (req, res, next) => {
  try {
    await prisma.collectionEntry.delete({ where: { userId_mediaId: { userId: req.user!.id, mediaId: req.params.mediaId } } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

collectionsRouter.get('/me/stats', async (req, res, next) => {
  try {
    const grouped = await prisma.collectionEntry.groupBy({
      by: ['status'],
      where: { userId: req.user!.id },
      _count: { status: true }
    });
    const totalReviews = await prisma.review.count({ where: { userId: req.user!.id } });
    res.json({ stats: { statuses: grouped, totalReviews } });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.get('/me/lists', async (req, res, next) => {
  try {
    const lists = await prisma.customList.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { media: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ lists: lists.map((list) => ({ ...list, items: list.items.map((item) => ({ ...item, media: serializeMedia(item.media) })) })) });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.post('/me/lists', async (req, res, next) => {
  try {
    const body = z.object({ title: z.string().min(2), description: z.string().optional(), isPublic: z.boolean().default(false) }).parse(req.body);
    const list = await prisma.customList.create({ data: { userId: req.user!.id, ...body } });
    await createActivity({ actorId: req.user!.id, type: 'LIST_CREATED', listId: list.id, payload: { title: list.title } });
    res.status(201).json({ list });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.patch('/me/lists/:id', async (req, res, next) => {
  try {
    const body = z.object({ title: z.string().min(2).optional(), description: z.string().nullable().optional(), isPublic: z.boolean().optional() }).parse(req.body);
    const existing = await prisma.customList.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new HttpError(404, 'Liste introuvable');
    const list = await prisma.customList.update({ where: { id: existing.id }, data: body });
    res.json({ list });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.delete('/me/lists/:id', async (req, res, next) => {
  try {
    const existing = await prisma.customList.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new HttpError(404, 'Liste introuvable');
    await prisma.customList.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

collectionsRouter.post('/me/lists/:id/items', async (req, res, next) => {
  try {
    const body = z.object({ tmdbId: z.number().int().positive(), type: z.enum(['MOVIE', 'TV', 'movie', 'tv']) }).parse(req.body);
    const list = await prisma.customList.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!list) throw new HttpError(404, 'Liste introuvable');
    const media = await getOrRefreshMedia(body.type, body.tmdbId);
    const item = await prisma.customListItem.upsert({
      where: { listId_mediaId: { listId: list.id, mediaId: media.id } },
      create: { listId: list.id, mediaId: media.id },
      update: {},
      include: { media: true }
    });
    res.status(201).json({ item: { ...item, media: serializeMedia(item.media) } });
  } catch (error) {
    next(error);
  }
});

collectionsRouter.delete('/me/lists/:id/items/:mediaId', async (req, res, next) => {
  try {
    const list = await prisma.customList.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!list) throw new HttpError(404, 'Liste introuvable');
    await prisma.customListItem.delete({ where: { listId_mediaId: { listId: list.id, mediaId: req.params.mediaId } } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
