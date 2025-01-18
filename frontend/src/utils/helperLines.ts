// this utility function can be called with a position change (inside onNodesChange)
// it checks all other nodes and calculates the helper line positions and the position where the current node should snap to

// Define types for the function parameters and return values
interface Position {
    x: number
    y: number
}

interface Measured {
    width?: number
    height?: number
}

interface Node {
    id: string
    position: Position
    measured?: Measured
}

interface Change {
    id: string
    position: Position
}

interface SnapPosition {
    x: number | undefined
    y: number | undefined
}

interface HelperLinesResult {
    horizontal: number | undefined
    vertical: number | undefined
    snapPosition: SnapPosition
}

export function getHelperLines(change: Change, nodes: Node[], distance: number = 5): HelperLinesResult {
    const defaultResult: HelperLinesResult = {
        horizontal: undefined,
        vertical: undefined,
        snapPosition: { x: undefined, y: undefined },
    }

    const nodeA = nodes.find((node) => node.id === change.id)

    if (!nodeA || !change.position) {
        return defaultResult
    }

    const nodeABounds = {
        left: change.position.x,
        right: change.position.x + (nodeA.measured?.width ?? 0),
        top: change.position.y,
        bottom: change.position.y + (nodeA.measured?.height ?? 0),
        width: nodeA.measured?.width ?? 0,
        height: nodeA.measured?.height ?? 0,
    }

    let horizontalDistance = distance
    let verticalDistance = distance

    return nodes
        .filter((node) => node.id !== nodeA.id)
        .reduce<HelperLinesResult>((result, nodeB) => {
            const nodeBBounds = {
                left: nodeB.position.x,
                right: nodeB.position.x + (nodeB.measured?.width ?? 0),
                top: nodeB.position.y,
                bottom: nodeB.position.y + (nodeB.measured?.height ?? 0),
                width: nodeB.measured?.width ?? 0,
                height: nodeB.measured?.height ?? 0,
            }

            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     A     |
            //  |___________|
            //  |
            //  |
            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     B     |
            //  |___________|
            const distanceLeftLeft = Math.abs(nodeABounds.left - nodeBBounds.left)

            if (distanceLeftLeft < verticalDistance) {
                result.snapPosition.x = nodeBBounds.left
                result.vertical = nodeBBounds.left
                verticalDistance = distanceLeftLeft
            }

            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     A     |
            //  |___________|
            //              |
            //              |
            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     B     |
            //  |___________|
            const distanceRightRight = Math.abs(nodeABounds.right - nodeBBounds.right)

            if (distanceRightRight < verticalDistance) {
                result.snapPosition.x = nodeBBounds.right - nodeABounds.width
                result.vertical = nodeBBounds.right
                verticalDistance = distanceRightRight
            }

            //              |‾‾‾‾‾‾‾‾‾‾‾|
            //              |     A     |
            //              |___________|
            //              |
            //              |
            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     B     |
            //  |___________|
            const distanceLeftRight = Math.abs(nodeABounds.left - nodeBBounds.right)

            if (distanceLeftRight < verticalDistance) {
                result.snapPosition.x = nodeBBounds.right
                result.vertical = nodeBBounds.right
                verticalDistance = distanceLeftRight
            }

            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     A     |
            //  |___________|
            //              |
            //              |
            //              |‾‾‾‾‾‾‾‾‾‾‾|
            //              |     B     |
            //              |___________|
            const distanceRightLeft = Math.abs(nodeABounds.right - nodeBBounds.left)

            if (distanceRightLeft < verticalDistance) {
                result.snapPosition.x = nodeBBounds.left - nodeABounds.width
                result.vertical = nodeBBounds.left
                verticalDistance = distanceRightLeft
            }

            //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾|
            //  |     A     |     |     B     |
            //  |___________|     |___________|
            const distanceTopTop = Math.abs(nodeABounds.top - nodeBBounds.top)

            if (distanceTopTop < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.top
                result.horizontal = nodeBBounds.top
                horizontalDistance = distanceTopTop
            }

            //  |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     A     |
            //  |___________|_________________
            //                    |           |
            //                    |     B     |
            //                    |___________|
            const distanceBottomTop = Math.abs(nodeABounds.bottom - nodeBBounds.top)

            if (distanceBottomTop < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.top - nodeABounds.height
                result.horizontal = nodeBBounds.top
                horizontalDistance = distanceBottomTop
            }

            //  |‾‾‾‾‾‾‾‾‾‾‾|     |‾‾‾‾‾‾‾‾‾‾‾|
            //  |     A     |     |     B     |
            //  |___________|_____|___________|
            const distanceBottomBottom = Math.abs(nodeABounds.bottom - nodeBBounds.bottom)

            if (distanceBottomBottom < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.bottom - nodeABounds.height
                result.horizontal = nodeBBounds.bottom
                horizontalDistance = distanceBottomBottom
            }

            //                    |‾‾‾‾‾‾‾‾‾‾‾|
            //                    |     B     |
            //                    |           |
            //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
            //  |     A     |
            //  |___________|
            const distanceTopBottom = Math.abs(nodeABounds.top - nodeBBounds.bottom)

            if (distanceTopBottom < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.bottom
                result.horizontal = nodeBBounds.bottom
                horizontalDistance = distanceTopBottom
            }

            return result
        }, defaultResult)
}
