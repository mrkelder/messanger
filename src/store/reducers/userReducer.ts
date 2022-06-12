import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import LocalStorage from "src/utils/LocalStorage";

import { USER_DATA_LOCAL_STORAGE_NAME } from "../CONSTANTS";

interface UserData {
  _id: string;
  userName: string;
}

const initialState = {
  _id: "",
  userName: ""
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, { payload }: PayloadAction<UserData>) {
      state.userName = payload.userName;
      state._id = payload._id;
      LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, state);
    },
    initStoreFromLocalStorage(state) {
      const data = LocalStorage.get<typeof initialState>(
        USER_DATA_LOCAL_STORAGE_NAME
      );
      const { userName, _id } = data ?? {};

      if (userName && _id) {
        state.userName = userName;
        state._id = _id;
      } else {
        state = initialState;
        LocalStorage.set(USER_DATA_LOCAL_STORAGE_NAME, state);
      }
    },
    clear(state) {
      state._id = initialState._id;
      state.userName = initialState.userName;
      LocalStorage.remove(USER_DATA_LOCAL_STORAGE_NAME);
    }
  }
});

export const { setUserData, initStoreFromLocalStorage, clear } =
  userSlice.actions;
export default userSlice.reducer;
