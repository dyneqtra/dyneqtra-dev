import { create } from 'zustand'

export type Mode = 'pointer' | 'hand' | 'select' | 'connect' // Add other valid modes as needed

interface ModeState {
    mode: Mode
    setMode: (mode: Mode) => void
}

export const useModeStore = create<ModeState>((set) => ({
    mode: 'hand',
    setMode: (mode) => set({ mode }),
}))
