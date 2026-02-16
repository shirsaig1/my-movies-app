import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Movie, MovieFilter, MoviesState } from "./moviesTypes";

const INITIAL_PAGE = 1;
const INITIAL_FILTER: MovieFilter = "popular";

const initialState: MoviesState = {
  movies: [],
  isLoading: false,
  error: null,
  page: INITIAL_PAGE,
  filter: INITIAL_FILTER,
  searchQuery: "",
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    fetchMoviesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMoviesSuccess: (state, action: PayloadAction<Movie[]>) => {
      state.movies = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchMoviesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.movies = [];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setFilter: (state, action: PayloadAction<MovieFilter>) => {
      state.filter = action.payload;
      state.page = INITIAL_PAGE;
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = INITIAL_PAGE;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchMoviesRequest,
  fetchMoviesSuccess,
  fetchMoviesFailure,
  setSearchQuery,
  setFilter,
  setPage,
  clearError,
} = moviesSlice.actions;

export default moviesSlice.reducer;
