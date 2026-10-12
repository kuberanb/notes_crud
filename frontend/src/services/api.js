
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setCredentials, clearCredentials } from "../features/auth/authSlice"

const rawBaseQuery = fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }

            return headers
        }
    })

// Concurrent notes requests share one refresh operation.
let refreshPromise = null

async function baseQueryWithRefresh(args, queryApi, extraOptions) { 
    const url = typeof args === 'string' ? args : args.url
    const isNotes = /^\/?notes(?:\/|$)/.test(url)
    const send = (request) => rawBaseQuery(request, queryApi, extraOptions)

    if (isNotes && refreshPromise) await refreshPromise

    const oldToken = queryApi.getState().auth.accessToken
    const result = await send(args)
    if (!isNotes || result.error?.status !== 401) return result

    const currentToken = queryApi.getState().auth.accessToken
    if (currentToken && currentToken !== oldToken) return send(args)

    if (!refreshPromise) {
        refreshPromise = send({ url: '/auth/refresh', method: 'POST' })
            .then(({ data, error }) => {
                const accessToken = data?.data?.accessToken
                if (accessToken) {
                    queryApi.dispatch(setCredentials({ accessToken }))
                } else if ([401, 403].includes(error?.status)) {
                    queryApi.dispatch(clearCredentials())
                }
                return Boolean(accessToken)
            })
            .finally(() => { refreshPromise = null })
    }

    return (await refreshPromise) ? send(args) : result
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithRefresh,
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
