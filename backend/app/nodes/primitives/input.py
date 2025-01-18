from typing import Any, Dict, List
from pydantic import BaseModel, create_model
from ..base import (
    BaseNodeInput,
    BaseNodeOutput,
    VariableOutputBaseNode,
    VariableOutputBaseNodeConfig,
)


class InputNodeConfig(VariableOutputBaseNodeConfig):
    """
    Configuration for the InputNode.
    enforce_schema: bool = False. If True, the output_schema will be enforced. Otherwise the output will be the same as the input.
    output_schema: Dict[str, str] = {"input_1": "str"}. The schema of the output.
    """

    enforce_schema: bool = False
    output_schema: Dict[str, str] = {"input_1": "str"}
    pass


class InputNodeInput(BaseNodeInput):
    pass


class InputNodeOutput(BaseNodeOutput):
    pass


class InputNode(VariableOutputBaseNode):
    """
    Node for defining dataset schema and using the output as input for other nodes.
    """

    name = "input_node"
    display_name = "Input"
    config_model = InputNodeConfig
    input_model = InputNodeInput
    output_model = InputNodeOutput

    async def __call__(
        self,
        input: (
            Dict[str, str | int | bool | float | Dict[str, Any] | List[Any]]
            | Dict[str, BaseNodeOutput]
            | Dict[str, BaseNodeInput]
            | BaseNodeInput
        ),
    ) -> BaseNodeOutput:
        if isinstance(input, dict):
            if not any(isinstance(value, BaseNodeOutput) for value in input.values()):
                # create a new model based on the input dictionary
                fields = {key: (type(value), ...) for key, value in input.items()}
                self.output_model = create_model(  # type: ignore
                    self.name,
                    __base__=BaseNodeOutput,
                    **fields,  # type: ignore
                )
                return self.output_model.model_validate(input)  # type: ignore
        return await super().__call__(input)

    async def run(self, input: BaseModel) -> BaseModel:
        if self.config.enforce_schema:
            return input
        else:
            fields = {
                key: (value.annotation, ...)
                for key, value in input.model_fields.items()
                if value.annotation is not None
            }

            new_output_model = create_model(  # type: ignore
                "InputNodeOutput",
                __base__=InputNodeOutput,
                **fields,  # type: ignore
            )
            self.output_model = new_output_model
            ret_value = self.output_model.model_validate(input.model_dump())  # type: ignore
            return ret_value  # type: ignore
