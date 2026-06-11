import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth';
import { comparePassword, hashPassword, isStrongPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export const authRouter = Router();

const publicUserSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  website: true,
  role: true,
  theme: true,
  language: true,
  createdAt: true
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(60)
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    if (!isStrongPassword(body.password)) {
      throw new HttpError(400, 'Le mot de passe doit contenir 8 caractères, une majuscule, une minuscule et un chiffre');
    }

    const userCount = await prisma.user.count();
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        displayName: body.displayName,
        passwordHash: await hashPassword(body.password),
        role: userCount === 0 ? 'ADMIN' : 'USER'
      },
      select: publicUserSelect
    });

    const token = signToken({ userId: user.id, tokenVersion: 0 });
    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error?.code === 'P2002') return next(new HttpError(409, 'Cet email est déjà utilisé'));
    next(error);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });

    if (!user?.passwordHash || !(await comparePassword(body.password, user.passwordHash))) {
      throw new HttpError(401, 'Email ou mot de passe incorrect');
    }

    if (user.banned) throw new HttpError(403, 'Compte banni');

    const token = signToken({ userId: user.id, tokenVersion: user.tokenVersion });
    const safeUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUserSelect });
    res.json({ user: safeUser, token });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, select: publicUserSelect });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { tokenVersion: { increment: 1 } }
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.get('/oauth/github/url', (_req, res, next) => {
  try {
    if (!env.GITHUB_CLIENT_ID) throw new HttpError(503, 'OAuth GitHub n’est pas configuré');
    const callback = env.GITHUB_CALLBACK_URL ?? `${env.API_PUBLIC_URL}/api/auth/oauth/github/callback`;
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: callback,
      scope: 'read:user user:email'
    });
    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/oauth/github/callback', async (req, res, next) => {
  try {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) throw new HttpError(503, 'OAuth GitHub n’est pas configuré');
    const code = z.string().min(1).parse(req.query.code);
    const callback = env.GITHUB_CALLBACK_URL ?? `${env.API_PUBLIC_URL}/api/auth/oauth/github/callback`;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callback
      })
    });
    const tokenData = await tokenResponse.json() as { access_token?: string; error_description?: string };
    if (!tokenData.access_token) throw new HttpError(401, tokenData.error_description ?? 'OAuth GitHub refusé');

    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: { authorization: `Bearer ${tokenData.access_token}`, accept: 'application/json' }
    });
    const githubUser = await githubUserResponse.json() as any;

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: { authorization: `Bearer ${tokenData.access_token}`, accept: 'application/json' }
    });
    const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
    const email = emails.find((item) => item.primary && item.verified)?.email ?? githubUser.email;
    if (!email) throw new HttpError(400, 'Aucun email vérifié trouvé sur GitHub');

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      create: {
        email: email.toLowerCase(),
        displayName: githubUser.name ?? githubUser.login,
        avatarUrl: githubUser.avatar_url,
        oauthProvider: 'github',
        oauthId: String(githubUser.id)
      },
      update: {
        avatarUrl: githubUser.avatar_url,
        oauthProvider: 'github',
        oauthId: String(githubUser.id)
      }
    });

    const token = signToken({ userId: user.id, tokenVersion: user.tokenVersion });
    res.redirect(`${env.WEB_PUBLIC_URL}/oauth/success?token=${encodeURIComponent(token)}`);
  } catch (error) {
    next(error);
  }
});
