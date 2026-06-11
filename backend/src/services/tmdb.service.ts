import { MediaType } from '@prisma/client';
import { env } from '../config/env';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';

type TmdbSearchItem = {
  id: number;
  media_type?: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  popularity?: number;
  vote_average?: number;
};

const baseUrl = 'https://api.themoviedb.org/3';

function assertTmdbConfigured() {
  if (!env.TMDB_API_TOKEN || env.TMDB_API_TOKEN.startsWith('replace_me')) {
    throw new HttpError(503, 'TMDB_API_TOKEN n’est pas configuré côté serveur');
  }
}

async function tmdbFetch<T>(path: string): Promise<T> {
  assertTmdbConfigured();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new HttpError(response.status, `Erreur API TMDB (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function toMediaType(type: string): MediaType {
  return type === 'tv' ? 'TV' : 'MOVIE';
}

function toTmdbType(type: MediaType | string) {
  return String(type).toUpperCase() === 'TV' ? 'tv' : 'movie';
}

function dateOrNull(value?: string | null) {
  return value ? new Date(value) : null;
}

export async function searchTmdb(input: {
  query: string;
  page?: number;
  type?: 'movie' | 'tv' | 'all';
  year?: string;
  sort?: 'popularity' | 'date' | 'title';
}) {
  const page = input.page ?? 1;
  const type = input.type ?? 'all';
  const endpoint = type === 'all' ? '/search/multi' : `/search/${type}`;
  const params = new URLSearchParams({
    query: input.query,
    page: String(page),
    language: 'fr-FR',
    include_adult: 'false'
  });

  if (input.year) {
    if (type === 'tv') params.set('first_air_date_year', input.year);
    else params.set('year', input.year);
  }

  const data = await tmdbFetch<{ page: number; total_pages: number; total_results: number; results: TmdbSearchItem[] }>(
    `${endpoint}?${params.toString()}`
  );

  const results = data.results
    .filter((item) => {
      const mediaType = item.media_type ?? type;
      return mediaType === 'movie' || mediaType === 'tv';
    })
    .map((item) => {
      const mediaType = item.media_type ?? type;
      return {
        tmdbId: item.id,
        type: toMediaType(mediaType),
        title: item.title ?? item.name ?? 'Sans titre',
        overview: item.overview ?? '',
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
        releaseDate: item.release_date ?? item.first_air_date ?? null,
        popularity: item.popularity ?? 0,
        voteAverage: item.vote_average ?? 0
      };
    })
    .sort((a, b) => {
      if (input.sort === 'date') return String(b.releaseDate ?? '').localeCompare(String(a.releaseDate ?? ''));
      if (input.sort === 'title') return a.title.localeCompare(b.title);
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    });

  return { ...data, results };
}

export async function getOrRefreshMedia(type: MediaType | string, tmdbId: number) {
  const mediaType = String(type).toUpperCase() === 'TV' ? 'TV' : 'MOVIE';
  const existing = await prisma.media.findUnique({ where: { tmdbId_type: { tmdbId, type: mediaType } } });
  const maxAgeMs = env.TMDB_CACHE_TTL_MINUTES * 60 * 1000;

  if (existing && Date.now() - existing.cachedAt.getTime() < maxAgeMs) {
    return existing;
  }

  const tmdbType = toTmdbType(mediaType);
  const details = await tmdbFetch<any>(`/${tmdbType}/${tmdbId}?language=fr-FR&append_to_response=credits`);

  return prisma.media.upsert({
    where: { tmdbId_type: { tmdbId, type: mediaType } },
    create: {
      tmdbId,
      type: mediaType,
      title: details.title ?? details.name ?? 'Sans titre',
      overview: details.overview ?? null,
      posterPath: details.poster_path ?? null,
      backdropPath: details.backdrop_path ?? null,
      releaseDate: dateOrNull(details.release_date ?? details.first_air_date),
      genres: details.genres ?? [],
      runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
      raw: details,
      cachedAt: new Date()
    },
    update: {
      title: details.title ?? details.name ?? 'Sans titre',
      overview: details.overview ?? null,
      posterPath: details.poster_path ?? null,
      backdropPath: details.backdrop_path ?? null,
      releaseDate: dateOrNull(details.release_date ?? details.first_air_date),
      genres: details.genres ?? [],
      runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
      raw: details,
      cachedAt: new Date()
    }
  });
}

export function serializeMedia(media: any) {
  return {
    ...media,
    posterUrl: media.posterPath ? `https://image.tmdb.org/t/p/w500${media.posterPath}` : null,
    backdropUrl: media.backdropPath ? `https://image.tmdb.org/t/p/w780${media.backdropPath}` : null
  };
}
