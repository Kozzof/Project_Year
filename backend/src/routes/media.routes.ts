import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { getOrRefreshMedia, searchTmdb, serializeMedia } from '../services/tmdb.service';

export const mediaRouter = Router();

mediaRouter.get('/search', async (req, res, next) => {
  try {
    const query = z.object({
      q: z.string().min(2),
      page: z.coerce.number().int().positive().default(1),
      type: z.enum(['movie', 'tv', 'all']).default('all'),
      year: z.string().optional(),
      sort: z.enum(['popularity', 'date', 'title']).default('popularity')
    }).parse(req.query);

    const results = await searchTmdb({ query: query.q, page: query.page, type: query.type, year: query.year, sort: query.sort });
    res.json(results);
  } catch (error) {
    next(error);
  }
});

mediaRouter.get('/global', async (req, res, next) => {
  try {
    const query = z.object({ q: z.string().min(2), page: z.coerce.number().int().positive().default(1) }).parse(req.query);
    const [media, users, lists] = await Promise.all([
      searchTmdb({ query: query.q, page: query.page, type: 'all', sort: 'popularity' }),
      prisma.user.findMany({
        where: {
          banned: false,
          OR: [
            { displayName: { contains: query.q, mode: 'insensitive' } },
            { email: { contains: query.q, mode: 'insensitive' } }
          ]
        },
        select: { id: true, displayName: true, avatarUrl: true, bio: true },
        take: 10
      }),
      prisma.customList.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { description: { contains: query.q, mode: 'insensitive' } }
          ]
        },
        include: { user: { select: { id: true, displayName: true } }, items: { include: { media: true } } },
        take: 10,
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    res.json({
      media: media.results,
      users,
      lists: lists.map((list) => ({
        ...list,
        items: list.items.map((item) => ({ ...item, media: serializeMedia(item.media) }))
      })),
      page: media.page,
      total_pages: media.total_pages,
      total_results: media.total_results
    });
  } catch (error) {
    next(error);
  }
});

mediaRouter.get('/:type/:tmdbId', async (req, res, next) => {
  try {
    const params = z.object({
      type: z.enum(['movie', 'tv', 'MOVIE', 'TV']),
      tmdbId: z.coerce.number().int().positive()
    }).parse(req.params);

    const media = await getOrRefreshMedia(params.type, params.tmdbId);
    const [aggregate, reviews] = await Promise.all([
      prisma.review.aggregate({ where: { mediaId: media.id }, _avg: { rating: true }, _count: { rating: true } }),
      prisma.review.findMany({
        where: { mediaId: media.id },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          likes: true,
          comments: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } }
        },
        orderBy: [{ highlighted: 'desc' }, { createdAt: 'desc' }]
      })
    ]);

    res.json({
      media: serializeMedia(media),
      community: {
        averageRating: aggregate._avg.rating,
        ratingsCount: aggregate._count.rating
      },
      reviews: reviews.map((review) => ({ ...review, likesCount: review.likes.length }))
    });
  } catch (error) {
    next(error);
  }
});
