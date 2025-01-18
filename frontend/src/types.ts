export interface Node {
    id: string
    data: NodeData
    // Add other node properties as needed
}

export interface NodeData {
    status?: string
    run?: any // Define a more specific type if possible
    // Add other node data properties as needed
}

export interface RunOutputData {
    status: string
    [key: string]: any
}

export interface RunOutputs {
    [nodeId: string]: RunOutputData
}

export interface RunStatusResponse {
    status: string
    outputs?: RunOutputs
    id: string
}

// Add other type definitions as needed
