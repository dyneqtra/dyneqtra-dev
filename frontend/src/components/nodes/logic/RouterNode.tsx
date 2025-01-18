import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Handle, Position, useConnection, useUpdateNodeInternals } from '@xyflow/react'
import BaseNode from '../BaseNode'
import { Input, Card, Divider, Button, Select, SelectItem, RadioGroup, Radio } from '@nextui-org/react'
import { useDispatch, useSelector } from 'react-redux'
import { FlowWorkflowNode, FlowWorkflowNodeConfig, updateNodeConfigOnly } from '../../../store/flowSlice'
import styles from '../DynamicNode.module.css'
import { Icon } from '@iconify/react'
import { RootState } from '../../../store/store'
import {
    ComparisonOperator,
    LogicalOperator,
    RouteConditionRule,
    RouteConditionGroup,
} from '../../../types/api_types/routerSchemas'
import NodeOutputDisplay from '../NodeOutputDisplay'
import { isEqual } from 'lodash'

interface RouterNodeData {
    title?: string
    color?: string
    acronym?: string
    run?: Record<string, any>
    taskStatus?: string
}

interface RouterNodeProps {
    id: string
    data: RouterNodeData
    selected?: boolean
    readOnly?: boolean
}

const OPERATORS: { value: ComparisonOperator; label: string }[] = [
    { value: ComparisonOperator.CONTAINS, label: 'Contains' },
    { value: ComparisonOperator.EQUALS, label: 'Equals' },
    { value: ComparisonOperator.NUMBER_EQUALS, label: 'Number Equals' },
    { value: ComparisonOperator.GREATER_THAN, label: 'Greater Than' },
    { value: ComparisonOperator.LESS_THAN, label: 'Less Than' },
    { value: ComparisonOperator.STARTS_WITH, label: 'Starts With' },
    { value: ComparisonOperator.NOT_STARTS_WITH, label: 'Does Not Start With' },
    { value: ComparisonOperator.IS_EMPTY, label: 'Is Empty' },
    { value: ComparisonOperator.IS_NOT_EMPTY, label: 'Is Not Empty' },
]

const DEFAULT_CONDITION: RouteConditionRule = {
    variable: '',
    operator: ComparisonOperator.CONTAINS,
    value: '',
}

const DEFAULT_ROUTE: RouteConditionGroup = {
    conditions: [{ ...DEFAULT_CONDITION }],
}

const estimateTextWidth = (text: string): number => {
    // Approximate character widths (in pixels)
    const averageCharWidth = 8 // for normal text
    const spaceWidth = 4 // for spaces
    return text.length * averageCharWidth + text.split(' ').length * spaceWidth
}

export const RouterNode: React.FC<RouterNodeProps> = ({ id, data, readOnly = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [nodeWidth, setNodeWidth] = useState<string>('auto')
    const nodeRef = useRef<HTMLDivElement | null>(null)
    const dispatch = useDispatch()
    const nodes = useSelector((state: RootState) => state.flow.nodes)
    const edges = useSelector((state: RootState) => state.flow.edges)
    const nodeConfig = useSelector((state: RootState) => state.flow.nodeConfigs[id])
    const nodeConfigs = useSelector((state: RootState) => state.flow.nodeConfigs)
    const [predecessorNodes, setPredecessorNodes] = useState(
        edges
            .filter((edge) => edge.target === id)
            .map((edge) => nodes.find((node) => node.id === edge.source))
            .filter(Boolean)
    )

    const connection = useConnection()

    // Add a type guard to check if the node is a FlowWorkflowNode
    const isFlowWorkflowNode = (node: any): node is FlowWorkflowNode => {
        return 'type' in node
    }

    // Recompute predecessor nodes whenever edges/connections change
    useEffect(() => {
        const updatedPredecessors = edges
            .filter((edge) => edge.target === id)
            .map((edge) => nodes.find((node) => node.id === edge.source))
            .filter(Boolean)

        let finalPredecessors = updatedPredecessors

        // If a new connection is in progress to this node, show that source node as well
        if (connection.inProgress && connection.toNode?.id === id && connection.fromNode) {
            const existing = finalPredecessors.find((p) => p?.id === connection.fromNode?.id)
            if (!existing && isFlowWorkflowNode(connection.fromNode)) {
                finalPredecessors = [...finalPredecessors, connection.fromNode]
            }
        }

        // Deduplicate
        finalPredecessors = finalPredecessors.filter((node, index, self) => {
            return self.findIndex((n) => n?.id === node?.id) === index
        })

        // Compare to existing predecessorNodes; only set if changed
        const hasChanged =
            finalPredecessors.length !== predecessorNodes.length ||
            finalPredecessors.some((node, i) => !isEqual(node, predecessorNodes[i]))
        if (hasChanged) {
            setPredecessorNodes(finalPredecessors)
        }
    }, [connection, edges, id, nodes, predecessorNodes])

    // Get available input variables from the connected node's output schema
    const inputVariables = useMemo(() => {
        if (!predecessorNodes.length) return []
        return predecessorNodes.flatMap((node) => {
            if (!node) return []

            const predNodeConfig = nodeConfigs[node.id]
            const nodeTitle = predNodeConfig?.title || node.id
            const outputSchema = predNodeConfig?.output_schema || {}

            return Object.entries(outputSchema).map(([key, type]) => ({
                value: `${nodeTitle}.${key}`,
                label: `${nodeTitle}.${key} (${type})`,
            }))
        })
    }, [predecessorNodes, nodeConfigs])

    useEffect(() => {
        if (!nodeRef.current) return

        // We have multiple input handle labels
        const inputLabels = predecessorNodes.map((pred) => pred?.data?.config?.title || pred?.id || '')

        // Output label is the node's title or fallback
        const outputLabels = [nodeConfig?.title || 'Coalesce']

        // Compute the max length among all input labels
        const maxInputLabelLength = inputLabels.reduce((max, label) => Math.max(max, label.length), 0)
        // Compute the max length among all output labels
        const maxOutputLabelLength = outputLabels.reduce((max, label) => Math.max(max, label.length), 0)

        // The node's own title (for the top of the node)
        const nodeTitle = nodeConfig?.title || 'Coalesce'
        const nodeTitleLength = nodeTitle.length

        // Some extra spacing
        const buffer = 5

        // Rough estimate: multiply the longest label length by ~10 for width in px.
        const minNodeWidth = 300
        const maxNodeWidth = 600

        const estimatedWidth = Math.max(
            (maxInputLabelLength + maxOutputLabelLength + buffer) * 10,
            nodeTitleLength * 10,
            minNodeWidth
        )
        const finalWidth = Math.min(estimatedWidth, maxNodeWidth)

        // If collapsed, show auto; otherwise the computed width
        if (nodeWidth !== `${finalWidth}px`) {
            setNodeWidth(isCollapsed ? 'auto' : `${finalWidth}px`)
        }
    }, [predecessorNodes, nodeConfig?.title, isCollapsed])

    const handleUpdateRouteMap = (newRouteMap: Record<string, RouteConditionGroup>) => {
        dispatch(
            updateNodeConfigOnly({
                id,
                data: {
                    ...nodeConfig,
                    route_map: newRouteMap,
                },
            })
        )
    }

    const addRoute = () => {
        const newRouteKey = `route${Object.keys(nodeConfig?.route_map || {}).length + 1}`
        const newRouteMap = {
            ...(nodeConfig?.route_map || {}),
            [newRouteKey]: { ...DEFAULT_ROUTE },
        }
        handleUpdateRouteMap(newRouteMap)
    }

    const removeRoute = (routeKey: string) => {
        if (!nodeConfig?.route_map) return
        const { [routeKey]: _, ...newRouteMap } = nodeConfig.route_map
        handleUpdateRouteMap(newRouteMap)
    }

    const addCondition = (routeKey: string) => {
        if (!nodeConfig?.route_map) return
        const newRouteMap = {
            ...nodeConfig.route_map,
            [routeKey]: {
                conditions: [
                    ...(nodeConfig.route_map[routeKey].conditions || []),
                    { ...DEFAULT_CONDITION, logicalOperator: 'AND' as const },
                ],
            },
        }
        handleUpdateRouteMap(newRouteMap)
    }

    const removeCondition = (routeKey: string, conditionIndex: number) => {
        if (!nodeConfig?.route_map) return
        const newRouteMap = {
            ...nodeConfig.route_map,
            [routeKey]: {
                conditions: nodeConfig.route_map[routeKey].conditions.filter((_, i) => i !== conditionIndex),
            },
        }
        handleUpdateRouteMap(newRouteMap)
    }

    const updateCondition = (
        routeKey: string,
        conditionIndex: number,
        field: keyof RouteConditionRule,
        value: string
    ) => {
        if (!nodeConfig?.route_map) return
        const newRouteMap = {
            ...nodeConfig.route_map,
            [routeKey]: {
                conditions: nodeConfig.route_map[routeKey].conditions.map((condition, i) =>
                    i === conditionIndex ? { ...condition, [field]: value } : condition
                ),
            },
        }
        handleUpdateRouteMap(newRouteMap)
    }

    useEffect(() => {
        // If route_map is empty, initialize it with a default route
        if (!nodeConfig?.route_map || Object.keys(nodeConfig.route_map).length === 0) {
            handleUpdateRouteMap({
                route1: { ...DEFAULT_ROUTE },
            })
        }
    }, [])

    return (
        <BaseNode
            id={id}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            data={{
                title: nodeConfig?.title || 'Conditional Router',
                color: data.color || '#F6AD55',
                acronym: 'RN',
                run: data.run,
                config: nodeConfig,
                taskStatus: data.taskStatus,
            }}
            style={{ width: nodeWidth }}
            className="hover:!bg-background"
        >
            <div className="p-3" ref={nodeRef}>
                {/* Input handles */}
                {predecessorNodes.map((node) => {
                    if (!node) return null
                    const predNodeConfig = nodeConfigs[node.id]
                    const handleId = predNodeConfig?.title || node.id
                    return (
                        <div key={node.id} className={`${styles.handleRow} w-full justify-start mb-4`}>
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={handleId}
                                className={`${styles.handle} ${styles.handleLeft} ${isCollapsed ? styles.collapsedHandleInput : ''}`}
                            />
                            {!isCollapsed && (
                                <span className="text-sm font-medium ml-2 text-foreground">
                                    {predNodeConfig?.title || node.id}
                                </span>
                            )}
                        </div>
                    )
                })}

                {!isCollapsed && nodeConfig?.route_map && (
                    <>
                        <Divider className="my-2" />

                        {/* Expressions Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-foreground">Expressions</span>
                            <Divider className="flex-grow" />
                        </div>

                        {/* Routes */}
                        <div className="flex flex-col gap-4">
                            {Object.entries(nodeConfig.route_map).map(([routeKey, route]) => (
                                <Card
                                    key={routeKey}
                                    classNames={{
                                        base: 'bg-background dark:bg-default-100/10 border-default-200 p-1',
                                    }}
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Conditions */}
                                        {route.conditions.map((condition, conditionIndex) => (
                                            <div key={conditionIndex} className="flex flex-col gap-2">
                                                {conditionIndex > 0 && (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <RadioGroup
                                                            orientation="horizontal"
                                                            value={condition.logicalOperator}
                                                            onValueChange={(value) =>
                                                                updateCondition(
                                                                    routeKey,
                                                                    conditionIndex,
                                                                    'logicalOperator',
                                                                    value
                                                                )
                                                            }
                                                            size="sm"
                                                            isDisabled={readOnly}
                                                        >
                                                            <Radio value="AND">AND</Radio>
                                                            <Radio value="OR">OR</Radio>
                                                        </RadioGroup>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    <Select
                                                        aria-label="Select variable"
                                                        size="sm"
                                                        selectedKeys={condition.variable ? [condition.variable] : []}
                                                        onChange={(e) =>
                                                            updateCondition(
                                                                routeKey,
                                                                conditionIndex,
                                                                'variable',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Select variable"
                                                        className="flex-[2] min-w-[200px]"
                                                        variant="flat"
                                                        classNames={{
                                                            trigger: 'dark:bg-default-50/10',
                                                            base: 'dark:bg-default-50/10',
                                                            popoverContent: 'dark:bg-default-50/10',
                                                        }}
                                                        renderValue={(items) => {
                                                            return items.map((item) => (
                                                                <div key={item.key} className="flex items-center">
                                                                    <span className="text-default-700 dark:text-default-300">
                                                                        {item.textValue}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        }}
                                                        isMultiline={true}
                                                        isDisabled={readOnly}
                                                    >
                                                        {inputVariables.map((variable) => (
                                                            <SelectItem
                                                                key={variable.value}
                                                                value={variable.value}
                                                                textValue={variable.label}
                                                                className="text-default-700 dark:text-default-300"
                                                            >
                                                                <div className="whitespace-normal">
                                                                    <span>{variable.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                    <Select
                                                        aria-label="Select operator"
                                                        size="sm"
                                                        selectedKeys={condition.operator ? [condition.operator] : []}
                                                        onChange={(e) =>
                                                            updateCondition(
                                                                routeKey,
                                                                conditionIndex,
                                                                'operator',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-[140px] flex-none"
                                                        variant="flat"
                                                        classNames={{
                                                            trigger: 'dark:bg-default-50/10',
                                                            base: 'dark:bg-default-50/10',
                                                            popoverContent: 'dark:bg-default-50/10',
                                                        }}
                                                        renderValue={(items) => {
                                                            return items.map((item) => (
                                                                <div key={item.key} className="flex items-center">
                                                                    <span className="text-default-700 dark:text-default-300">
                                                                        {item.textValue}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        }}
                                                        isDisabled={readOnly}
                                                    >
                                                        {OPERATORS.map((op) => (
                                                            <SelectItem
                                                                key={op.value}
                                                                value={op.value}
                                                                textValue={op.label}
                                                                className="text-default-700 dark:text-default-300"
                                                            >
                                                                {op.label}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                    {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                                                        <Input
                                                            size="sm"
                                                            isRequired
                                                            value={condition.value}
                                                            onChange={(e) =>
                                                                updateCondition(
                                                                    routeKey,
                                                                    conditionIndex,
                                                                    'value',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Value"
                                                            className="flex-[2] min-w-[100px]"
                                                            classNames={{
                                                                label: 'text-default-700 dark:text-default-300',
                                                                input: [
                                                                    'text-default-700 !text-default-700',
                                                                    'dark:!text-default-300',
                                                                    'placeholder:text-default-700',
                                                                    'dark:placeholder:text-default-300',
                                                                    '[&.group-data-\[has-value\=true\]\:text-default-foreground]:text-default-700',
                                                                    'dark:[&.group-data-\[has-value\=true\]\:text-default-foreground]:text-default-300',
                                                                ],
                                                                innerWrapper: 'bg-transparent',
                                                                inputWrapper: [
                                                                    'bg-default-100 dark:bg-default-50/10',
                                                                    'hover:bg-default-200 dark:hover:bg-default-50/20',
                                                                    'group-data-[focus=true]:bg-default-100 dark:group-data-[focus=true]:bg-default-50/30',
                                                                    '!border-0',
                                                                ],
                                                            }}
                                                            isDisabled={readOnly}
                                                        />
                                                    )}
                                                    {!readOnly && (
                                                        <Button
                                                            size="sm"
                                                            color="danger"
                                                            isIconOnly
                                                            onClick={() => removeCondition(routeKey, conditionIndex)}
                                                            disabled={route.conditions.length === 1}
                                                            className="flex-none"
                                                        >
                                                            <Icon icon="solar:trash-bin-trash-linear" width={18} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Condition Button */}
                                        {!readOnly && (
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="light"
                                                onClick={() => addCondition(routeKey)}
                                                startContent={
                                                    <Icon
                                                        icon="solar:add-circle-linear"
                                                        width={18}
                                                        className="text-foreground"
                                                    />
                                                }
                                                className="text-foreground"
                                            >
                                                Add Condition
                                            </Button>
                                        )}

                                        {/* Route Output Handle */}
                                        <div className={`${styles.handleRow} w-full justify-end mt-2`}>
                                            <div className="align-center flex flex-grow flex-shrink mr-2">
                                                <span className="text-sm font-medium ml-auto text-foreground">
                                                    {routeKey}
                                                </span>
                                            </div>
                                            <Handle
                                                type="source"
                                                position={Position.Right}
                                                id={routeKey}
                                                className={`${styles.handle} ${styles.handleRight} ${isCollapsed ? styles.collapsedHandleOutput : ''}`}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Add Route Button */}
                            {!readOnly && (
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="light"
                                    onClick={addRoute}
                                    startContent={
                                        <Icon icon="solar:add-circle-linear" width={18} className="text-foreground" />
                                    }
                                    className="text-foreground"
                                >
                                    Add Route
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {/* Output handles when collapsed */}
                {isCollapsed &&
                    nodeConfig?.route_map &&
                    Object.keys(nodeConfig.route_map).map((routeKey) => (
                        <div key={routeKey} className={`${styles.handleRow} w-full justify-end mt-2`}>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={routeKey}
                                className={`${styles.handle} ${styles.handleRight} ${styles.collapsedHandleOutput}`}
                            />
                        </div>
                    ))}
            </div>
            <NodeOutputDisplay output={data.run} />
        </BaseNode>
    )
}
