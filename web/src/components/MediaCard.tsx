import { Link } from 'react-router-dom';
import { posterFallback } from '../api/client';

export type MediaSearchResult = {
  tmdbId: number;
  type: 'MOVIE' | 'TV';
  title: string;
  overview?: string;
  posterUrl?: string | null;
  releaseDate?: string | null;
  voteAverage?: number;
};

export function MediaCard({ media }: { media: MediaSearchResult }) {
  return (
    <Link className="media-card" to={`/media/${media.type.toLowerCase()}/${media.tmdbId}`}>
      <img src={media.posterUrl ?? posterFallback} alt={media.title} />
      <div>
        <strong>{media.title}</strong>
        <span>{media.type === 'MOVIE' ? 'Film' : 'Série'} · {media.releaseDate?.slice(0, 4) ?? 'Date inconnue'}</span>
        <p>{media.overview || 'Aucun résumé disponible.'}</p>
      </div>
    </Link>
  );
}
