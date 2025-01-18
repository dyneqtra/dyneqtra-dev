from typing import Any, Dict
from pydantic import BaseModel, Field
from ..base import (
    BaseNodeInput,
    BaseNodeOutput,
    VariableOutputBaseNode,
    VariableOutputBaseNodeConfig,
)
from ...utils.pydantic_utils import get_nested_field


class OutputNodeConfig(VariableOutputBaseNodeConfig):
    """
    Configuration for the OutputNode.
    """

    output_map: Dict[str, str] = Field(
        default=dict[str, str](),
        title="Output Map",
        description="A dictionary mapping input field names to output field names.",
    )


class OutputNodeInput(BaseNodeInput):
    pass


class OutputNodeOutput(BaseNodeOutput):
    pass


class OutputNode(VariableOutputBaseNode):
    """
    Node for defining output schema and using the input from other nodes.
    """

    name = "output_node"
    display_name = "Output"
    config_model = OutputNodeConfig
    input_model = OutputNodeInput
    output_model = OutputNodeOutput

    async def run(self, input: BaseModel) -> BaseModel:
        output: Dict[str, Any] = {}
        if self.config.output_map:
            for output_key, input_key in self.config.output_map.items():
                # input_key is the field name with dot notation to access nested fields
                output[output_key] = get_nested_field(input_key, input)
        else:
            output = input.model_dump()
        return self.output_model(**output)
