import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  userName: string;
}

const initialState = {
  accessToken: "",
  userData: {
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
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData.userName = action.payload.userName;
    }
  }
});

export const { setAccessToken, setUserData } = userSlice.actions;
export default userSlice.reducer;
