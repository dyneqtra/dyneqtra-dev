import { createSlice } from '@reduxjs/toolkit'

interface UserPreferencesState {
    hasSeenWelcome: boolean
}

const initialState: UserPreferencesState = {
    hasSeenWelcome: false,
}

const userPreferencesSlice = createSlice({
    name: 'userPreferences',
    initialState,
    reducers: {
        markWelcomeSeen: (state) => {
            state.hasSeenWelcome = true
        },
    },
})

export const { markWelcomeSeen } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer
