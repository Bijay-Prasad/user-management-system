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
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/users/me",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
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
