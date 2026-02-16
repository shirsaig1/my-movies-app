import { all } from "redux-saga/effects";
import { watchMoviesSaga, watchSearchSaga } from "../features/movies/moviesSaga";

export default function* rootSaga() {
  yield all([watchMoviesSaga(),  watchSearchSaga()]);
}

