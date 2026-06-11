import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { corsOrigins } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { authRouter } from './routes/auth.routes';
import { collectionsRouter } from './routes/collections.routes';
import { feedRouter } from './routes/feed.routes';
import { mediaRouter } from './routes/media.routes';
import { messagesRouter } from './routes/messages.routes';
import { moderationRouter } from './routes/moderation.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { usersRouter } from './routes/users.routes';

export const app = express();

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'supcontent-backend' }));

app.use('/api/auth', authRouter);
app.use('/api/media', mediaRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/feed', feedRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', moderationRouter);
app.use('/api/messages', messagesRouter);

app.use(notFound);
app.use(errorHandler);
