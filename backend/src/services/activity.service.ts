import { ActivityType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function createActivity(input: {
  actorId: string;
  type: ActivityType;
  mediaId?: string;
  reviewId?: string;
  listId?: string;
  payload?: Prisma.InputJsonValue;
}) {
  return prisma.activity.create({
    data: {
      actorId: input.actorId,
      type: input.type,
      mediaId: input.mediaId,
      reviewId: input.reviewId,
      listId: input.listId,
      payload: input.payload ?? {}
    }
  });
}
