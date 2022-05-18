import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import LocalStorage from "src/utils/LocalStorage";

import { USER_DATA_LOCAL_STORAGE_NAME } from "../CONSTANTS";

interface UserData {
  userName: string;
}

const initialState = {
  userName: ""
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, { payload }: PayloadAction<UserData>) {
      state.userName = payload.userName;
      LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, state);
    },
    initStoreFromLocalStorage(state) {
      const data = LocalStorage.get<typeof initialState>(
        USER_DATA_LOCAL_STORAGE_NAME
      );
      const { userName } = data ?? {};

      if (userName) {
        state.userName = userName;
      } else {
        state = initialState;
        LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, state);
      }
    }
  }
});

export const { setUserData, initStoreFromLocalStorage } = userSlice.actions;
export default userSlice.reducer;
