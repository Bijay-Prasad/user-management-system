import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/app/config";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/users/me",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(userData, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dynamically import setUser to avoid circular dependency issues if any,
          // usually fine if store imports API but API shouldn't import slice reducer index directly if recursive.
          // However, we can dispatch the action type string or import just the action creator if safe.
          // Safety: We import { setUser } from authSlice.
          // Assuming authSlice is already loaded.
          // If circular dependency occurs, we might need to move slice actions or types.
          // But here, let's try importing at top level. If runtime error, we fix.
          dispatch(require("./authSlice").setUser(data.user));
        } catch (err) {
           // update failed
        }
      },
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: "/users/me/password",
        method: "PUT",
        body: passwordData,
      }),
    }),
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/users?page=${page}&limit=${limit}`,
      providesTags: ["User"],
    }),
    toggleUserStatus: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/status`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAllUsersQuery,
  useToggleUserStatusMutation,
} = userApi;
