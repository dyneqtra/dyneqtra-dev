import importlib
from typing import Any, List, Dict

from ..schemas.node_type_schemas import NodeTypeSchema
from .base import BaseNode

from .node_types import (
    SUPPORTED_NODE_TYPES,
    get_all_node_types,
    is_valid_node_type,
)


class NodeFactory:
    """
    Factory for creating node instances from a configuration.
    Node type definitions are expected to be in the nodes package.

    Conventions:
    - The node class should be named <NodeTypeName>Node
    - The config model should be named <NodeTypeName>NodeConfig
    - The input model should be named <NodeTypeName>NodeInput
    - The output model should be named <NodeTypeName>NodeOutput
    - There should be only one node type class per module
    - The module name should be the snake_case version of the node type name

    Example:
    - Node type: Example
    - Node class: ExampleNode
    - Config model: ExampleNodeConfig
    - Input model: ExampleNodeInput
    - Output model: ExampleNodeOutput
    - Module name: example

    - Node type: MCTS
    - Node class: MCTSNode
    - Config model: MCTSNodeConfig
    - Input model: MCTSNodeInput
    - Output model: MCTSNodeOutput
    - Module name: llm.mcts
    """

    @staticmethod
    def get_all_node_types() -> Dict[str, List[NodeTypeSchema]]:
        """
        Returns a dictionary of all available node types grouped by category.
        """
        return get_all_node_types()

    @staticmethod
    def create_node(node_name: str, node_type_name: str, config: Any) -> BaseNode:
        """
        Creates a node instance from a configuration.
        """
        if not is_valid_node_type(node_type_name):
            raise ValueError(f"Node type '{node_type_name}' is not valid.")

        module_name = None
        class_name = None
        # Use the imported _SUPPORTED_NODE_TYPES
        for node_group in SUPPORTED_NODE_TYPES.values():
            for node_type in node_group:
                if node_type["node_type_name"] == node_type_name:
                    module_name = node_type["module"]
                    class_name = node_type["class_name"]
                    break
            if module_name and class_name:
                break

        if not module_name or not class_name:
            raise ValueError(f"Node type '{node_type_name}' not found.")

        module = importlib.import_module(module_name, package="app")
        node_class = getattr(module, class_name)
        return node_class(name=node_name, config=node_class.config_model(**config))
