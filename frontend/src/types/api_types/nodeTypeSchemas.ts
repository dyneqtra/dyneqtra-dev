export interface NodeTypeSchema {
    node_type_name: string
    class_name: string
    module: string
}

export interface MinimumNodeConfigSchema {
    node_type: NodeTypeSchema
}
