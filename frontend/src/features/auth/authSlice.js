

import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        accessToken: null
    },
    reducers: {
        setCredentials(state, { payload }) {
            state.accessToken = payload.accessToken

            if (payload.user) {
                state.user = payload.user
            }
        },
        clearCredentials(state) {
            state.user = null
            state.accessToken = null
        }
    }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
