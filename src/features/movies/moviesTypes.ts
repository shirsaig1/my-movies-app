export interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export interface MovieDetails extends Movie {
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: { id: number; name: string }[];
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  backdrop_path?: string;
}

export type MovieFilter = "popular" | "now_playing" | "favorites";

export interface FavoriteMovie extends Movie {
  added_at: number;
}

export interface MoviesState {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  page: number;
  filter: MovieFilter;
  searchQuery: string;
}

export interface MoviesState {
  movies: Movie[];
  isLoading: boolean;
  page: number;
  filter: MovieFilter;
  searchQuery: string;
}
