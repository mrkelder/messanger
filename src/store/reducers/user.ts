import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  accessToken: "",
  info: {
    userName: ""
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    setUserData(state, action: PayloadAction<string>) {
      state.info.userName = action.payload;
    }
  }
});

export const { setAccessToken, setUserData } = userSlice.actions;
export default userSlice.reducer;
