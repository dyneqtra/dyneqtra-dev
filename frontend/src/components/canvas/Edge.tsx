import React, { useCallback, useMemo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow, EdgeProps, Edge } from '@xyflow/react'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { useDispatch } from 'react-redux'
import { deleteEdge } from '../../store/flowSlice'
import { useTheme } from 'next-themes'

// Static styles
const staticStyles = {
    labelContainer: {
        position: 'absolute' as const,
        pointerEvents: 'all' as const,
    },
    buttonContainer: {
        display: 'flex',
        gap: '5px',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '4px',
        borderRadius: '9999px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
} as const

// Add this near the other static styles
const getEdgeStyle = (isDark: boolean) =>
    ({
        strokeWidth: 2,
        stroke: isDark ? '#888' : '#555',
    }) as const

interface CustomEdgeData extends Edge<any> {
    onPopoverOpen: (params: {
        sourceNode: {
            id: string
            position: { x: number; y: number }
            data: any
        }
        targetNode: {
            id: string
            position: { x: number; y: number }
            data: any
        }
        edgeId: string
    }) => void
    showPlusButton: boolean
}

interface CustomEdgeProps extends EdgeProps {
    data: {
        onPopoverOpen?: (data: any) => void
        showPlusButton?: boolean
    }
    readOnly?: boolean
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
    source,
    target,
    readOnly = false,
}) => {
    const { onPopoverOpen, showPlusButton } = data
    const reactFlowInstance = useReactFlow()
    const dispatch = useDispatch()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Get the full node objects
    const sourceNode = reactFlowInstance.getNode(source)
    const targetNode = reactFlowInstance.getNode(target)

    // Memoize the path calculation
    const [edgePath, labelX, labelY] = useMemo(
        () =>
            getBezierPath({
                sourceX,
                sourceY,
                sourcePosition,
                targetX,
                targetY,
                targetPosition,
            }),
        [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]
    )

    // Memoize the label style
    const labelStyle = useMemo(
        () => ({
            ...staticStyles.labelContainer,
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        }),
        [labelX, labelY]
    )

    // Memoize handlers
    const handleAddNode = useCallback(() => {
        if (!sourceNode || !targetNode) {
            console.error('Source or target node not found')
            return
        }
        onPopoverOpen({
            sourceNode: {
                id: sourceNode.id,
                position: sourceNode.position,
                data: sourceNode.data,
            },
            targetNode: {
                id: targetNode.id,
                position: targetNode.position,
                data: targetNode.data,
            },
            edgeId: id,
        })
    }, [sourceNode, targetNode, id, onPopoverOpen])

    const handleDeleteEdge = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation()
            dispatch(deleteEdge({ edgeId: id }))
        },
        [id, dispatch]
    )

    // Memoize the combined edge style
    const combinedStyle = useMemo(
        () => ({
            ...getEdgeStyle(isDark),
            ...style,
        }),
        [JSON.stringify(style)]
    )

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={combinedStyle} />

            {showPlusButton && !readOnly && (
                <EdgeLabelRenderer>
                    <div style={labelStyle} className="nodrag nopan">
                        <div style={staticStyles.buttonContainer}>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                radius="full"
                                onClick={handleAddNode}
                                className="bg-background hover:bg-default-100"
                            >
                                <Icon icon="solar:add-circle-bold-duotone" className="text-primary" width={20} />
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                radius="full"
                                onClick={handleDeleteEdge}
                                className="bg-background hover:bg-default-100"
                            >
                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-danger" width={20} />
                            </Button>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    )
}

export default React.memo(CustomEdge)
