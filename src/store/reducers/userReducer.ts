import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import LocalStorage from "src/utils/LocalStorage";

import { USER_DATA_LOCAL_STORAGE_NAME } from "../CONSTANTS";

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
      LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, state);
    },
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData.userName = action.payload.userName;
      LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, state);
    },
    initStoreFromLocalStorage(state) {
      const data = LocalStorage.get<typeof initialState>(
        USER_DATA_LOCAL_STORAGE_NAME
      );
      const { accessToken, userData } = data ?? {};

      if (accessToken && userData && userData.userName) {
        state.accessToken = accessToken;
        state.userData.userName = userData.userName;
      }
    }
  }
});

export const { setAccessToken, setUserData, initStoreFromLocalStorage } =
  userSlice.actions;
export default userSlice.reducer;
