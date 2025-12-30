import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "user";
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Clear persistence handled by persist/PURGE if needed, or allow persistor.purge() call in component
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.token;
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        authApi.endpoints.signup.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.token;
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
