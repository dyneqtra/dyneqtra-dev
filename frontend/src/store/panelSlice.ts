import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PanelState {
    isNodePanelExpanded: boolean
}

const initialState: PanelState = {
    isNodePanelExpanded: false,
}

export const panelSlice = createSlice({
    name: 'panel',
    initialState,
    reducers: {
        setNodePanelExpanded: (state, action: PayloadAction<boolean>) => {
            state.isNodePanelExpanded = action.payload
        },
        toggleNodePanelExpanded: (state) => {
            state.isNodePanelExpanded = !state.isNodePanelExpanded
        },
    },
})

export const { setNodePanelExpanded, toggleNodePanelExpanded } = panelSlice.actions
export default panelSlice.reducer
