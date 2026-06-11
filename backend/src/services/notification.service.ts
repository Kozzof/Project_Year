import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function notifyUser(input: {
  userId: string;
  type: NotificationType;
  payload: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      payload: input.payload
    }
  });
}
