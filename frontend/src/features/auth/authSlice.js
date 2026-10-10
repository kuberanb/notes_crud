

import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        acessToken: null
    },
    reducers: {
        setCredentials(state, { payload }) {
            state.acessToken = payload.acessToken

            if (payload.user) {
                state.user = payload.user
            }
        },
        clearCredentials(state) {
            state.user = null,
                state.acessToken = null
        }
    }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer