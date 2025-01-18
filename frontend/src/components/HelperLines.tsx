import { useEffect, useRef } from 'react'
import { useStore } from '@xyflow/react'

// Define the type for the store state
interface StoreState {
    width: number
    height: number
    transform: [number, number, number] // Assuming transform is a tuple of three numbers
}

// Define the props for the component
interface HelperLinesRendererProps {
    horizontal?: number // Optional number
    vertical?: number // Optional number
}

const canvasStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'none',
}

const storeSelector = (state: StoreState) => ({
    width: state.width,
    height: state.height,
    transform: state.transform,
})

// A simple component to display the helper lines
// It puts a canvas on top of the React Flow pane and draws the lines using the canvas API
function HelperLinesRenderer({ horizontal, vertical }: HelperLinesRendererProps) {
    const { width, height, transform } = useStore(storeSelector)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')

        if (!ctx || !canvas) {
            return
        }

        const dpi = window.devicePixelRatio
        canvas.width = width * dpi
        canvas.height = height * dpi

        ctx.scale(dpi, dpi)
        ctx.clearRect(0, 0, width, height)
        ctx.strokeStyle = '#0041d0'

        if (typeof vertical === 'number') {
            ctx.beginPath()
            ctx.moveTo(vertical * transform[2] + transform[0], 0)
            ctx.lineTo(vertical * transform[2] + transform[0], height)
            ctx.stroke()
        }

        if (typeof horizontal === 'number') {
            ctx.beginPath()
            ctx.moveTo(0, horizontal * transform[2] + transform[1])
            ctx.lineTo(width, horizontal * transform[2] + transform[1])
            ctx.stroke()
        }
    }, [width, height, transform, horizontal, vertical])

    return <canvas ref={canvasRef} className="react-flow__canvas" style={canvasStyle} />
}

export default HelperLinesRenderer
