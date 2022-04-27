import { configureStore } from "@reduxjs/toolkit";

import defaultReducer from "./reducers/defaultReducer";

const reducer = {
  default: defaultReducer
};

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== "production"
});

export default store;
