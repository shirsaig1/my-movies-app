import { call, put, takeLatest, debounce, select } from "redux-saga/effects";
import type { AxiosError } from "axios";
import axiosInstance from "../../utils/axiosInstance";
import {
  fetchMoviesRequest,
  fetchMoviesSuccess,
  fetchMoviesFailure,
  setSearchQuery,
  setFilter,
  setPage,
} from "./moviesSlice";
import { getFavoriteMovies } from "../../utils/api";
import type { MoviesState, Movie } from "./moviesTypes";
import type { RootState } from "../../store/store";

// Configuration constants
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 5,
  WINDOW_MS: 10000,
} as const;

const SEARCH_CONFIG = {
  DEBOUNCE_MS: 500,
  MIN_LENGTH: 2,
} as const;

const CACHE_CONFIG = {
  TTL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

const API_ENDPOINTS = {
  POPULAR: "/movie/popular",
  NOW_PLAYING: "/movie/now_playing",
  SEARCH: "/search/movie",
} as const;

// Cache implementation
interface CacheEntry {
  data: Movie[];
  timestamp: number;
}
const movieCache = new Map<string, CacheEntry>();

function getCacheKey(
  filter: string,
  page: number,
  searchQuery: string,
): string {
  return `${filter}_page${page}_search${searchQuery || ""}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_CONFIG.TTL_MS;
}

// Rate limiting implementation
let requestTimestamps: number[] = [];

function isRequestAllowed(): boolean {
  const now = Date.now();
  // Remove timestamps outside the rate limit window
  requestTimestamps = requestTimestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_CONFIG.WINDOW_MS,
  );

  if (requestTimestamps.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    return false;
  }

  requestTimestamps.push(now);
  return true;
}

function* fetchMovies(): Generator<unknown, void, unknown> {
  try {
    const state = yield select((state: RootState) => state.movies);
    const { filter, page, searchQuery } = state as MoviesState;

    // Handle favorites from localStorage
    if (filter === "favorites") {
      const favorites = getFavoriteMovies();
      yield put(fetchMoviesSuccess(favorites));
      return;
    }

    const cacheKey = getCacheKey(filter, page, searchQuery);

    // Check cache first
    const cached = movieCache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      console.log(`[Cache HIT] ${cacheKey}`);
      yield put(fetchMoviesSuccess(cached.data));
      return;
    }

    console.log(`[Cache MISS/EXPIRED] ${cacheKey} - fetching from API`);

    // Determine endpoint based on filter and search
    let endpoint: string;
    if (searchQuery) {
      endpoint = API_ENDPOINTS.SEARCH;
    } else if (filter === "now_playing") {
      endpoint = API_ENDPOINTS.NOW_PLAYING;
    } else {
      endpoint = API_ENDPOINTS.POPULAR;
    }

    const params = searchQuery ? { query: searchQuery, page } : { page };

    const response = (yield call(() =>
      axiosInstance.get(endpoint, { params }),
    )) as { data?: { results?: unknown[] } };

    const data = response as { data?: { results?: unknown[] } };
    const movies: Movie[] = data.data?.results as Movie[];

    if (!Array.isArray(movies)) {
      throw new TypeError("Invalid API response: results is not an array");
    }

    // Cache the result
    movieCache.set(cacheKey, { data: movies, timestamp: Date.now() });
    yield put(fetchMoviesSuccess(movies));
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    yield put(fetchMoviesFailure(errorMessage));
  }
}

// Handler for filter changes - always fetch with page 1
function* handleFilterChange(): Generator<unknown, void, unknown> {
  // Filter change should always trigger fetch
  yield put(fetchMoviesRequest());
}

// Handler for page changes - fetch with current filter
function* handlePageChange(): Generator<unknown, void, unknown> {
  // Page change should always trigger fetch
  yield put(fetchMoviesRequest());
}

// Handler for search changes - with race condition prevention
function* handleSearch(action: {
  payload: string;
  type: string;
}): Generator<unknown, void, unknown> {
  try {
    const query = (action.payload ?? "").trim();

    // If search is cleared, fetch default content for current filter
    if (!query) {
      yield put(fetchMoviesRequest());
      return;
    }

    // Validate search query length
    if (query.length < SEARCH_CONFIG.MIN_LENGTH) {
      return;
    }

    // Check rate limiting
    if (!isRequestAllowed()) {
      console.warn(
        `Rate limit exceeded: max ${RATE_LIMIT_CONFIG.MAX_REQUESTS} requests per ${RATE_LIMIT_CONFIG.WINDOW_MS}ms`,
      );
      return;
    }

    // Fetch search results
    yield put(fetchMoviesRequest());
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    yield put(fetchMoviesFailure(errorMessage));
  }
}

// Helper function to format error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (error.message.includes("Network")) {
      return "Network error. Please check your connection.";
    }
    return error.message;
  }

  const axiosError = error as AxiosError;
  if (axiosError?.response?.status === 401) {
    return "Unauthorized: Invalid API key.";
  }
  if (axiosError?.response?.status === 404) {
    return "Resource not found.";
  }
  if (axiosError?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
}

export function* watchMoviesSaga() {
  yield takeLatest(fetchMoviesRequest, fetchMovies);
  yield takeLatest(setFilter, handleFilterChange);
  yield takeLatest(setPage, handlePageChange);
}

export function* watchSearchSaga() {
  yield debounce(SEARCH_CONFIG.DEBOUNCE_MS, setSearchQuery, handleSearch);
}
