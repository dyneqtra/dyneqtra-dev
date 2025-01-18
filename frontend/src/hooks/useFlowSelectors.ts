import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { nodeComparator } from '../utils/flowUtils'
import { FlowWorkflowNode } from '../store/flowSlice'

export const useNode = (id: string) => {
    return useSelector((state: RootState) => state.flow.nodes.find((n) => n.id === id), nodeComparator)
}

export const useNodes = () => {
    return useSelector((state: RootState) => state.flow.nodes)
}

export const useEdges = () => {
    return useSelector((state: RootState) => state.flow.edges)
}

export const useSelectedNodeId = () => {
    return useSelector((state: RootState) => state.flow.selectedNode)
}

export const useNodeTypes = () => {
    return useSelector((state: RootState) => state.nodeTypes.data)
}

export const useNodeOutputs = (nodeId: string) => {
    return useSelector((state: RootState) => {
        const node = state.flow.nodes.find((n) => n.id === nodeId)
        return node?.data?.run
    })
}

export const useNodeTitle = (nodeId: string) => {
    return useSelector((state: RootState) => {
        const node = state.flow.nodes.find((n) => n.id === nodeId)
        return node?.data?.config?.title || node?.data?.title || node?.type || 'Untitled'
    })
}
