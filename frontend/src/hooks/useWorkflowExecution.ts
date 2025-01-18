import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateNodeDataOnly, resetRun } from '../store/flowSlice'
import { getRunStatus, startRun, getWorkflowRuns, validateGoogleAccessToken } from '../utils/api'
import { RootState } from '../store/store'
import store from '../store/store'
import { AlertColor } from '../types/alert'

interface UseWorkflowExecutionProps {
    onAlert: (message: string, color: AlertColor) => void
}

interface WorkflowRun {
    id: string
    status: string
    start_time?: string
    end_time?: string
}

export const useWorkflowExecution = ({ onAlert }: UseWorkflowExecutionProps) => {
    const dispatch = useDispatch()
    const nodes = useSelector((state: RootState) => state.flow.nodes)
    const workflowId = useSelector((state: RootState) => state.flow.workflowID)
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [completionPercentage, setCompletionPercentage] = useState<number>(0)
    const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

    let currentStatusInterval: NodeJS.Timeout | null = null

    const updateWorkflowStatus = async (runID: string): Promise<void> => {
        if (currentStatusInterval) {
            clearInterval(currentStatusInterval)
        }
        currentStatusInterval = setInterval(async () => {
            try {
                const statusResponse = await getRunStatus(runID)
                const tasks = statusResponse.tasks

                if (statusResponse.percentage_complete !== undefined) {
                    setCompletionPercentage(statusResponse.percentage_complete)
                }

                if (tasks.length > 0) {
                    tasks.forEach((task) => {
                        const nodeId = task.node_id
                        let node = nodes.find((node) => node.id === nodeId)
                        if (!node) {
                            // find the node by title in nodeConfigs
                            const state = store.getState()
                            const correspondingNodeId = Object.keys(state.flow.nodeConfigs).find(
                                (key) => state.flow.nodeConfigs[key].title === nodeId
                            )
                            if (correspondingNodeId) {
                                node = nodes.find((node) => node.id === correspondingNodeId)
                            }
                        }
                        if (!node) {
                            return
                        }
                        const output_values = task.outputs || {}
                        const nodeTaskStatus = task.status
                        if (node) {
                            // Check if the task output or status is different from current node data
                            const isOutputDifferent = JSON.stringify(output_values) !== JSON.stringify(node.data?.run)
                            const isStatusDifferent = nodeTaskStatus !== node.data?.taskStatus

                            if (isOutputDifferent || isStatusDifferent) {
                                dispatch(
                                    updateNodeDataOnly({
                                        id: node.id,
                                        data: {
                                            run: { ...node.data.run, ...output_values },
                                            error: task.error || null,
                                            taskStatus: nodeTaskStatus,
                                        },
                                    })
                                )
                            }
                        }
                    })
                }

                if (statusResponse.status !== 'RUNNING') {
                    setIsRunning(false)
                    setCompletionPercentage(0)
                    clearInterval(currentStatusInterval)
                    onAlert('Workflow run completed.', 'success')
                }
                if (statusResponse.status === 'FAILED' || tasks.some((task) => task.status === 'FAILED')) {
                    setIsRunning(false)
                    setCompletionPercentage(0)
                    clearInterval(currentStatusInterval)
                    onAlert('Workflow run failed.', 'danger')
                    return
                }
            } catch (error) {
                console.error('Error fetching workflow status:', error)
                clearInterval(currentStatusInterval)
            }
        }, 1000)
    }

    const executeWorkflow = async (inputValues: Record<string, any>): Promise<void> => {
        if (!workflowId) return

        const hasGoogleSheetsReadNode = nodes.some((node) => node.type === 'GoogleSheetsReadNode')

        if (hasGoogleSheetsReadNode) {
            const response = await validateGoogleAccessToken()
            console.log('Token check response:', response)
            if (!response.is_valid) {
                const baseUrl = window.location.origin
                window.open(`${baseUrl}/google/auth`, '_blank')
                return
            }
        }

        try {
            dispatch(resetRun())
            onAlert('Starting workflow run...', 'default')
            const result = await startRun(workflowId, inputValues, null, 'interactive')
            setIsRunning(true)
            await fetchWorkflowRuns()
            updateWorkflowStatus(result.id)
        } catch (error) {
            console.error('Error starting workflow run:', error)
            onAlert('Error starting workflow run.', 'danger')
        }
    }

    const stopWorkflow = (): void => {
        setIsRunning(false)
        setCompletionPercentage(0)
        if (currentStatusInterval) {
            clearInterval(currentStatusInterval)
        }
        onAlert('Workflow run stopped.', 'warning')
    }

    const fetchWorkflowRuns = async () => {
        try {
            const response = await getWorkflowRuns(workflowId)
            setWorkflowRuns(response)
        } catch (error) {
            console.error('Error fetching workflow runs:', error)
        }
    }

    const updateRunStatuses = async () => {
        if (!workflowId) return

        setIsUpdatingStatus(true)
        try {
            // First fetch the latest workflow runs
            const latestRuns = await getWorkflowRuns(workflowId)
            setWorkflowRuns(latestRuns)

            // Then update the status of running/pending runs
            const updatedRuns = await Promise.all(
                latestRuns.map(async (run) => {
                    if (run.status.toLowerCase() === 'running' || run.status.toLowerCase() === 'pending') {
                        const statusResponse = await getRunStatus(run.id)
                        return { ...run, status: statusResponse.status }
                    }
                    return run
                })
            )

            setWorkflowRuns(updatedRuns)
        } catch (error) {
            console.error('Error updating run statuses:', error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    useEffect(() => {
        if (workflowId) {
            fetchWorkflowRuns()
        }
    }, [workflowId])

    return {
        isRunning,
        completionPercentage,
        workflowRuns,
        isUpdatingStatus,
        executeWorkflow,
        stopWorkflow,
        updateRunStatuses,
    }
}
