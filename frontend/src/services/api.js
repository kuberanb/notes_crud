
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/toolkit"

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }

            return headers
        }
    }),
    tagTypes: ['Notes'],
    endpoints: (builder) => ({

        register: builder.mutation({
            query: (body) => ({
                url: 'auth/register/',
                method: 'POST',
                body
            }),
            transformResponse: (response) => response.data,
        }),
        login: builder.mutation({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
            transformResponse: (response) => response.data,
        }),

        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
            transformResponse: (response) => response.data,
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),

        getNotes: builder.query({
            query: (page = 1) => ({
                url: '/notes',
                params: { page },
            }),
            transformResponse: (response) => response.data,
            providesTags: ['Notes'],
        }),

        getNote: builder.query({
            query: (id) => `/notes/${id}`,
            transformResponse: (response) => response.data,
            providesTags: ['Notes'],
        }),

        createNote: builder.mutation({
            query: (body) => ({
                url: '/notes',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Notes'],
        }),

        updateNote: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/notes/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Notes'],
        }),

        deleteNote: builder.mutation({
            query: (id) => ({
                url: `/notes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notes'],
        }),

    })

})

export const {
    useRegisterMutation,
    useLoginMutation,
    useRefreshMutation,
    useLogoutMutation,
    useGetNotesQuery,
    useGetNoteQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
} = api