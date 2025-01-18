export interface AlertState {
    message: string
    color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    isVisible: boolean
}

export type AlertColor = AlertState['color']
