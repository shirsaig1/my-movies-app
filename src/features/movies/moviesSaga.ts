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

const API_ENDPOINTS = {
  POPULAR: "/movie/popular",
  NOW_PLAYING: "/movie/now_playing",
  SEARCH: "/search/movie",
} as const;

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
    const { filter, page } = state as MoviesState;

    // Handle favorites from localStorage
    if (filter === "favorites") {
      const favorites = getFavoriteMovies();
      yield put(fetchMoviesSuccess(favorites));
      return;
    }

    // Determine API endpoint based on filter
    const endpoint =
      filter === "now_playing"
        ? API_ENDPOINTS.NOW_PLAYING
        : API_ENDPOINTS.POPULAR;

    const response = (yield call(() =>
      axiosInstance.get(endpoint, { params: { page } }),
    )) as { data?: { results?: unknown[] } };

    // Validate response data structure
    const data = response as { data?: { results?: unknown[] } };
    const movies: Movie[] = data.data?.results as Movie[];
    if (!Array.isArray(movies)) {
      throw new TypeError("Invalid API response: results is not an array");
    }

    yield put(fetchMoviesSuccess(movies));
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    yield put(fetchMoviesFailure(errorMessage));
  }
}

function* handleSearch(action: {
  payload: string;
}): Generator<unknown, void, unknown> {
  try {
    const query = (action.payload ?? "").trim();
    const state = yield select((state: RootState) => state.movies);
    const { filter, page } = state as MoviesState;

    // If search is cleared, fetch default content
    if (!query) {
      const endpoint =
        filter === "now_playing"
          ? API_ENDPOINTS.NOW_PLAYING
          : API_ENDPOINTS.POPULAR;

      const response = (yield call(() =>
        axiosInstance.get(endpoint, { params: { page } }),
      )) as { data?: { results?: unknown[] } };

      const movies: Movie[] = response.data?.results as Movie[];
      if (!Array.isArray(movies)) {
        throw new TypeError("Invalid API response: results is not an array");
      }

      yield put(fetchMoviesSuccess(movies));
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

    const response = (yield call(() =>
      axiosInstance.get(API_ENDPOINTS.SEARCH, { params: { query, page } }),
    )) as { data?: { results?: unknown[] } };

    const data = response as { data?: { results?: unknown[] } };
    const movies: Movie[] = data.data?.results as Movie[];
    if (!Array.isArray(movies)) {
      throw new TypeError("Invalid API response: results is not an array");
    }

    yield put(fetchMoviesSuccess(movies));
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    yield put(fetchMoviesFailure(errorMessage));
  }
}

function* handleFilterChange() {
  yield put(fetchMoviesRequest());
}

function* handlePageChange() {
  yield put(fetchMoviesRequest());
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
