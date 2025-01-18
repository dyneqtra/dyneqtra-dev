import { WorkflowDefinition } from '@/types/api_types/workflowSchemas'
import { TaskResponse } from '@/types/api_types/taskSchemas'

interface RolloutWorkflowParams {
    workflowDefinition: WorkflowDefinition
    tasks: TaskResponse[]
}

export function rolloutWorkflowDefinition({ workflowDefinition, tasks }: RolloutWorkflowParams): {
    rolledOutDefinition: WorkflowDefinition
    outputs: Record<string, any>
} {
    // Create a deep copy of the workflow definition to avoid mutations
    const rolledOutDefinition: WorkflowDefinition = JSON.parse(JSON.stringify(workflowDefinition))
    let outputs: Record<string, any> = {}

    // Process each task that has a subworkflow
    tasks.forEach((task) => {
        // Gather outputs from the task
        if (task.outputs) {
            outputs[task.node_id] = task.outputs
        }

        if (!task.subworkflow) return

        const nodeToReplace = rolledOutDefinition.nodes.find((node) => node.id === task.node_id)
        if (!nodeToReplace) return

        const subworkflow = task.subworkflow
        // Generate unique IDs for subworkflow nodes to avoid conflicts
        const prefix = `${task.node_id}_`

        // Gather outputs from subworkflow
        if (task.subworkflow_output) {
            Object.entries(task.subworkflow_output).forEach(([nodeId, output]) => {
                outputs[prefix + nodeId] = output
            })
        }

        const subworkflowNodes = subworkflow.nodes.map((node) => ({
            ...node,
            id: prefix + node.id,
            coordinates: {
                x: nodeToReplace.coordinates.x,
                y: nodeToReplace.coordinates.y,
            },
        }))

        // Find input and output nodes of the subworkflow
        const inputNode = subworkflowNodes.find((node) => node.node_type === 'InputNode')
        const outputNode = subworkflowNodes.find((node) => node.node_type === 'OutputNode')

        if (!inputNode || !outputNode) {
            console.error('Subworkflow missing input or output node')
            return
        }

        // Reroute incoming edges
        rolledOutDefinition.links.forEach((link) => {
            if (link.target_id === nodeToReplace.id) {
                link.target_id = inputNode.id
            }
            if (link.source_id === nodeToReplace.id) {
                link.source_id = outputNode.id
            }
        })

        // Remove the original node
        rolledOutDefinition.nodes = rolledOutDefinition.nodes.filter((node) => node.id !== nodeToReplace.id)

        // Add subworkflow nodes and edges
        rolledOutDefinition.nodes.push(...subworkflowNodes)
        rolledOutDefinition.links = rolledOutDefinition.links.concat(
            subworkflow.links.map((link) => ({
                ...link,
                source_id: prefix + link.source_id,
                target_id: prefix + link.target_id,
            }))
        )
    })

    return { rolledOutDefinition, outputs }
}
