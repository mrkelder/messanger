import { createReducer } from "@reduxjs/toolkit";

import { increment } from "../actions/defaultActions";

const initialState = { value: 0 };

const defaultReducer = createReducer(initialState, builder => {
  builder.addCase(increment, (state, action) => {
    state.value++;
  });
});

export default defaultReducer;
