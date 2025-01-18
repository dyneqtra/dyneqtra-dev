import React, { useCallback, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateNodeDataOnly, setEdges, updateNodeTitle, setSelectedNode } from '../../store/flowSlice'
import { Handle, Position } from '@xyflow/react'
import { Card, CardHeader, CardBody, Divider, Button, Input, Alert, Spinner } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import usePartialRun from '../../hooks/usePartialRun'
import { TaskStatus } from '@/types/api_types/taskSchemas'
import { AlertState } from '../../types/alert'
import isEqual from 'lodash/isEqual'
import { FlowWorkflowNode } from '@/store/flowSlice'
import { getNodeTitle, duplicateNode, deleteNode } from '../../utils/flowUtils'
import { RootState } from '../../store/store'
import store from '../../store/store'
import { createSelector } from '@reduxjs/toolkit'

const PUBLIC_URL = typeof window !== 'undefined' ? `http://${window.location.host}/` : 'http://localhost:6080/'

interface BaseNodeProps {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
    id: string
    data?: FlowWorkflowNode['data']
    children?: React.ReactNode
    style?: React.CSSProperties
    isInputNode?: boolean
    className?: string
    handleOpenModal?: (isModalOpen: boolean) => void
    positionAbsoluteX?: number
    positionAbsoluteY?: number
}

const staticStyles = {
    container: {
        position: 'relative' as const,
    },
    targetHandle: {
        top: '50%',
        left: 0,
        width: '30%',
        height: '100%',
        zIndex: 10,
        opacity: 0,
        pointerEvents: 'auto' as const,
    },
    dragHandle: {
        width: '100%',
        height: '100%',
        pointerEvents: 'none' as const,
    },
    controlsCard: {
        position: 'absolute' as const,
        top: '-50px',
        right: '0px',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'auto' as const,
    },
    baseTag: {
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        display: 'inline-block',
        color: '#fff',
    },
    collapseButton: {
        minWidth: 'auto',
        height: '24px',
        padding: '0 8px',
        fontSize: '0.8rem',
        marginRight: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlsContainer: {
        position: 'absolute' as const,
        top: '8px',
        right: '8px',
        display: 'flex',
        alignItems: 'center',
    },
} as const

const convertToPythonVariableName = (str: string): string => {
    if (!str) return ''

    // Replace spaces and hyphens with underscores
    str = str.replace(/[\s-]/g, '_')

    // Remove any non-alphanumeric characters except underscores
    str = str.replace(/[^a-zA-Z0-9_]/g, '')

    // Add underscore prefix only if first char is a number
    if (/^[0-9]/.test(str)) {
        str = '_' + str
    }

    return str
}

const baseNodeComparator = (prev: BaseNodeProps, next: BaseNodeProps) => {
    // Compare only the props that would trigger a meaningful visual change
    return (
        prev.isCollapsed === next.isCollapsed &&
        prev.id === next.id &&
        isEqual(prev.data, next.data) &&
        isEqual(prev.style, next.style) &&
        prev.isInputNode === next.isInputNode &&
        prev.className === next.className &&
        prev.positionAbsoluteX === next.positionAbsoluteX &&
        prev.positionAbsoluteY === next.positionAbsoluteY
    )
}

const selectInitialInputs = createSelector(
    (state: RootState) => state.flow.nodes,
    (state: RootState) => state.flow.testInputs,
    (nodes, testInputs) => {
        const inputNodeId = nodes.find((node) => node.type === 'InputNode')?.id
        if (testInputs && Array.isArray(testInputs) && testInputs.length > 0) {
            const { id, ...rest } = testInputs[0]
            return { [inputNodeId as string]: rest }
        }
        return { [inputNodeId as string]: {} }
    }
)

const selectAvailableOutputs = createSelector([(state: RootState) => state.flow.nodes], (nodes) => {
    const outputs: Record<string, any> = {}
    nodes.forEach((node) => {
        if (node.data?.run) {
            outputs[node.id] = node.data.run
        }
    })
    return outputs
})

const BaseNode: React.FC<BaseNodeProps> = ({
    isCollapsed,
    setIsCollapsed,
    handleOpenModal,
    id,
    data,
    children,
    style = {},
    isInputNode = false,
    className = '',
    positionAbsoluteX,
    positionAbsoluteY,
}) => {
    const [editingTitle, setEditingTitle] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const [showTitleError, setShowTitleError] = useState(false)
    const [titleInputValue, setTitleInputValue] = useState('')
    const [alert, setAlert] = useState<AlertState>({
        message: '',
        color: 'default',
        isVisible: false,
    })
    const dispatch = useDispatch()

    // Only keep the selectors we need for this component's functionality
    const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNode)

    const initialInputs = useSelector(selectInitialInputs, isEqual)

    const availableOutputs = useSelector(selectAvailableOutputs, isEqual)

    const { executePartialRun, loading } = usePartialRun()

    const showAlert = (message: string, color: AlertState['color']) => {
        setAlert({ message, color, isVisible: true })
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000)
    }

    const handleDelete = () => {
        deleteNode(id, selectedNodeId, dispatch)
    }

    const handleDuplicate = () => {
        if (!data || !positionAbsoluteX || !positionAbsoluteY) {
            console.error('Node position not found')
            return
        }

        duplicateNode(id, positionAbsoluteX, positionAbsoluteY, dispatch, store.getState as () => RootState)
    }

    const handlePartialRun = async () => {
        if (!data) {
            return
        }
        setIsRunning(true)
        const rerunPredecessors = false

        const workflowId = window.location.pathname.split('/').pop()
        if (!workflowId) return

        try {
            const result = await executePartialRun({
                workflowId,
                nodeId: data.title,
                initialInputs,
                partialOutputs: availableOutputs,
                rerunPredecessors,
            })

            if (result) {
                Object.entries(result).forEach(([nodeId, output_values]) => {
                    if (output_values) {
                        dispatch(
                            updateNodeDataOnly({
                                id: nodeId,
                                data: {
                                    run: {
                                        ...(data?.run || {}),
                                        ...(output_values || {}),
                                    },
                                },
                            })
                        )
                        dispatch(setSelectedNode({ nodeId }))
                    }
                })
                showAlert('Node execution completed successfully', 'success')
            }
        } catch (error: any) {
            console.error('Error running node:', error)
            // Extract error message from the response if available
            const errorMessage = error.response?.data?.detail || 'Node execution failed. Please check the inputs and try again.'
            showAlert(errorMessage, 'danger')
            // Prevent the error from propagating to the global error handler
            return
        } finally {
            setIsRunning(false)
        }
    }

    const isSelected = String(id) === String(selectedNodeId)

    const status = data.run ? 'completed' : ''

    const nodeRunStatus: TaskStatus = data.taskStatus as TaskStatus

    let borderColor = 'gray'

    switch (nodeRunStatus) {
        case 'PENDING':
            borderColor = 'yellow'
            break
        case 'RUNNING':
            borderColor = 'blue'
            break
        case 'COMPLETED':
            borderColor = '#4CAF50'
            break
        case 'FAILED':
            borderColor = 'red'
            break
        case 'CANCELLED':
            borderColor = 'gray'
            break
        default:
            if (status === 'completed') {
                borderColor = '#4CAF50'
            }
    }

    const { backgroundColor, ...restStyle } = style || {}

    const cardStyle = React.useMemo(
        () => ({
            ...restStyle,
            borderColor,
            borderStyle: 'solid',
            transition: 'border-color 0.1s, border-width 0.02s',
            pointerEvents: 'auto' as const,
        }),
        [restStyle, borderColor]
    )

    const acronym = data.acronym || 'N/A'
    const color = data.color || '#ccc'

    const tagStyle = React.useMemo(
        () => ({
            ...staticStyles.baseTag,
            backgroundColor: color,
        }),
        [color]
    )

    const handleTitleChange = (newTitle: string) => {
        const validTitle = convertToPythonVariableName(newTitle)
        if (validTitle && validTitle !== getNodeTitle(data)) {
            dispatch(updateNodeTitle({ nodeId: id, newTitle: validTitle }))
        }
    }

    const headerStyle = React.useMemo(
        () => ({
            position: 'relative' as const,
            paddingTop: '8px',
            paddingBottom: isCollapsed ? '0px' : '16px',
        }),
        [isCollapsed]
    )

    const titleStyle = React.useMemo(
        () => ({
            marginBottom: isCollapsed ? '4px' : '8px',
        }),
        [isCollapsed]
    )

    return (
        <>
            {alert.isVisible && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Alert color={alert.color}>{alert.message}</Alert>
                </div>
            )}
            <div style={staticStyles.container} draggable={false} className="group" id={`node-${id}`}>
                {showTitleError && (
                    <Alert
                        key={`alert-${id}`}
                        className="absolute -top-16 left-0 right-0 z-50"
                        color="danger"
                        onClose={() => setShowTitleError(false)}
                    >
                        Title cannot contain whitespace. Use underscores instead.
                    </Alert>
                )}
                {/* Container to hold the Handle and the content */}
                <div>
                    {/* Hidden target handle covering the entire node */}
                    <Handle
                        key={`handle-${id}`}
                        type="target"
                        position={Position.Left}
                        id={`node-body-${id}`}
                        style={staticStyles.targetHandle}
                        isConnectable={true}
                        isConnectableStart={false}
                    />

                    <div className="react-flow__node-drag-handle" style={staticStyles.dragHandle}>
                        <Card
                            key={`card-${id}`}
                            className={`base-node ${className || ''}`}
                            style={cardStyle}
                            classNames={{
                                base: `bg-background border-default-200 ${
                                    isSelected ? 'border-[3px]' : status === 'completed' ? 'border-[2px]' : 'border-[1px]'
                                } group-hover:border-[3px]`,
                            }}
                        >
                            {data && (
                                <CardHeader key={`header-${id}`} style={headerStyle}>
                                    {editingTitle ? (
                                        <Input
                                            autoFocus
                                            value={titleInputValue}
                                            size="sm"
                                            variant="bordered"
                                            radius="lg"
                                            onChange={(e) => {
                                                const validValue = convertToPythonVariableName(e.target.value)
                                                setTitleInputValue(validValue)
                                                handleTitleChange(validValue)
                                            }}
                                            onBlur={() => setEditingTitle(false)}
                                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                if (e.key === 'Enter' || e.key === 'Escape') {
                                                    e.stopPropagation()
                                                    e.preventDefault()
                                                    setEditingTitle(false)
                                                }
                                            }}
                                            classNames={{
                                                input: 'text-foreground dark:text-white',
                                                inputWrapper: 'dark:bg-default-100/50 bg-default-100',
                                            }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {data.logo && (
                                                <img
                                                    src={`${PUBLIC_URL}` + data.logo}
                                                    alt="Node Logo"
                                                    className="mr-2 max-h-8 max-w-8 mb-3"
                                                />
                                            )}
                                            <h3
                                                className="text-lg font-semibold text-center cursor-pointer hover:text-primary"
                                                style={titleStyle}
                                                onClick={() => {
                                                    setTitleInputValue(getNodeTitle(data))
                                                    setEditingTitle(true)
                                                }}
                                            >
                                                {getNodeTitle(data)}
                                            </h3>
                                        </div>
                                    )}

                                    <div style={staticStyles.controlsContainer}>
                                        <Button
                                            key={`collapse-btn-${id}`}
                                            size="sm"
                                            variant="flat"
                                            style={staticStyles.collapseButton}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setIsCollapsed(!isCollapsed)
                                            }}
                                        >
                                            {isCollapsed ? '▼' : '▲'}
                                        </Button>

                                        <div style={tagStyle} className="node-acronym-tag">
                                            {acronym}
                                        </div>
                                    </div>
                                </CardHeader>
                            )}
                            {!isCollapsed && <Divider key={`divider-${id}`} />}

                            <CardBody key={`body-${id}`} className="px-1">
                                {children}
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Controls - Update to use CSS-based hover */}
                <Card
                    key={`controls-card-${id}`}
                    style={staticStyles.controlsCard}
                    className={`opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
                    classNames={{
                        base: 'bg-background border-default-200 transition-opacity duration-200',
                    }}
                >
                    <div className="flex flex-row gap-1">
                        <Button
                            key={`run-btn-${id}`}
                            isIconOnly
                            radius="full"
                            variant="light"
                            onPress={handlePartialRun}
                            disabled={loading || isRunning}
                        >
                            {isRunning ? (
                                <Spinner key={`spinner-${id}`} size="sm" color="current" />
                            ) : (
                                <Icon
                                    key={`play-icon-${id}`}
                                    className="text-default-500"
                                    icon="solar:play-linear"
                                    width={22}
                                />
                            )}
                        </Button>
                        {!isInputNode && (
                            <Button
                                key={`delete-btn-${id}`}
                                isIconOnly
                                radius="full"
                                variant="light"
                                onPress={handleDelete}
                            >
                                <Icon
                                    key={`delete-icon-${id}`}
                                    className="text-default-500"
                                    icon="solar:trash-bin-trash-linear"
                                    width={22}
                                />
                            </Button>
                        )}
                        <Button
                            key={`duplicate-btn-${id}`}
                            isIconOnly
                            radius="full"
                            variant="light"
                            onPress={handleDuplicate}
                        >
                            <Icon
                                key={`duplicate-icon-${id}`}
                                className="text-default-500"
                                icon="solar:copy-linear"
                                width={22}
                            />
                        </Button>
                        {handleOpenModal && data?.run !== undefined && (
                            <Button
                                key={`modal-btn-${id}`}
                                isIconOnly
                                radius="full"
                                variant="light"
                                onPress={() => handleOpenModal(true)}
                            >
                                <Icon
                                    key={`view-icon-${id}`}
                                    className="text-default-500"
                                    icon="solar:eye-linear"
                                    width={22}
                                />
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </>
    )
}

export default BaseNode
