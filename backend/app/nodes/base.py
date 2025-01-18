from abc import ABC, abstractmethod
from hashlib import md5
from typing import Any, Dict, List, Optional, Type

from pydantic import BaseModel, Field, create_model
from ..execution.workflow_execution_context import WorkflowExecutionContext
from ..schemas.workflow_schemas import WorkflowDefinitionSchema


class VisualTag(BaseModel):
    """
    Pydantic model for visual tag properties.
    """

    acronym: str = Field(...)
    color: str = Field(
        ..., pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$"
    )  # Hex color code validation using regex


class BaseNodeConfig(BaseModel):
    """
    Base class for node configuration models.
    Each node must define its output_schema.
    """

    pass


class BaseNodeOutput(BaseModel):
    """
    Base class for all node outputs.
    Each node type will define its own output model that inherits from this.
    """

    pass


class BaseNodeInput(BaseModel):
    """
    Base class for node inputs.
    Each node's input model will be dynamically created based on its predecessor nodes,
    with fields named after node IDs and types being the corresponding NodeOutputModels.
    """

    pass


class BaseNode(ABC):
    """
    Base class for all nodes.
    Each node receives inputs as a Pydantic model where:
    - Field names are predecessor node IDs
    - Field types are the corresponding NodeOutputModels
    """

    name: str
    display_name: str = (
        ""  # Will be used for config title, defaults to class name if not set
    )
    logo: Optional[str] = None
    config_model: Type[BaseModel]
    output_model: Type[BaseNodeOutput]
    input_model: Type[BaseNodeInput]
    _config: BaseNodeConfig
    _input: BaseNodeInput
    _output: BaseNodeOutput
    visual_tag: VisualTag
    subworkflow: Optional[WorkflowDefinitionSchema]
    subworkflow_output: Optional[Dict[str, Any]]

    def __init__(
        self,
        name: str,
        config: BaseNodeConfig,
        context: Optional[WorkflowExecutionContext] = None,
    ) -> None:
        self.name = name
        self._config = config
        self.context = context
        self.subworkflow = None
        self.subworkflow_output = None
        if not hasattr(self, "visual_tag"):
            self.visual_tag = self.get_default_visual_tag()
        self.setup()

    def setup(self) -> None:
        """
        Setup method to define output_model and any other initialization.
        For dynamic schema nodes, these can be created based on self.config.
        """
        pass

    def create_output_model_class(
        self, output_schema: Dict[str, str]
    ) -> Type[BaseNodeOutput]:
        """
        Dynamically creates an output model based on the node's output schema.
        """
        return create_model(
            f"{self.name}",
            **{field_name: (field_type, ...) for field_name, field_type in output_schema.items()},  # type: ignore
            __base__=BaseNodeOutput,
        )

    def create_composite_model_instance(
        self, model_name: str, instances: List[BaseModel]
    ) -> Type[BaseNodeInput]:
        """
        Create a new Pydantic model that combines all the given models based on their instances.

        Args:
            instances: A list of Pydantic model instances.

        Returns:
            A new Pydantic model with fields named after the class names of the instances.
        """

        # Create the new model class
        return create_model(
            model_name,
            **{
                instance.__class__.__name__: (instance.__class__, ...)  # type: ignore
                for instance in instances
            },
            __base__=BaseNodeInput,
        )

    async def __call__(
        self,
        input: (
            Dict[str, str | int | bool | float | Dict[str, Any] | List[Any]]
            | Dict[str, BaseNodeOutput]
            | Dict[str, BaseNodeInput]
            | BaseNodeInput
        ),
    ) -> BaseNodeOutput:
        """
        Validates inputs and runs the node's logic.

        Args:
            inputs: Pydantic model containing predecessor outputs or a dictionary of node_id : NodeOutputModels

        Returns:
            The node's output model
        """
        if isinstance(input, dict):
            if all(
                isinstance(value, BaseNodeOutput) for value in input.values()
            ) or all(isinstance(value, BaseNodeInput) for value in input.values()):
                # Input is a dictionary of BaseNodeOutput instances, creating a composite model
                self.input_model = self.create_composite_model_instance(
                    model_name=self.input_model.__name__,
                    instances=list(input.values()),  # type: ignore we already checked that all values are BaseNodeOutput instances
                )
                data = {  # type: ignore
                    instance.__class__.__name__: instance.model_dump()  # type: ignore
                    for instance in input.values()
                }
                input = self.input_model.model_validate(data)
            else:
                # Input is not a dictionary of BaseNodeOutput instances, validating as BaseNodeInput
                input = self.input_model.model_validate(input)

        self._input = input
        result = await self.run(input)

        try:
            output_validated = self.output_model.model_validate(result.model_dump())
        except AttributeError:
            output_validated = self.output_model.model_validate(result)
        except Exception as e:
            raise ValueError(f"Output validation error in {self.name}: {e}")

        self._output = output_validated
        return output_validated

    @abstractmethod
    async def run(self, input: BaseModel) -> BaseModel:
        """
        Abstract method where the node's core logic is implemented.

        Args:
            inputs: Pydantic model containing predecessor outputs

        Returns:
            An instance compatible with output_model
        """
        pass

    @property
    def config(self) -> Any:
        """
        Return the node's configuration.
        """
        return self.config_model.model_validate(self._config.model_dump())

    def update_config(self, config: BaseNodeConfig) -> None:
        """
        Update the node's configuration.
        """
        self._config = config

    @property
    def input(self) -> Any:
        """
        Return the node's input.
        """
        return self.input_model.model_validate(self._input.model_dump())

    @property
    def output(self) -> Any:
        """
        Return the node's output.
        """
        return self.output_model.model_validate(self._output.model_dump())

    @classmethod
    def get_default_visual_tag(cls) -> VisualTag:
        """
        Set a default visual tag for the node.
        """
        # default acronym is the first letter of each word in the node name
        acronym = "".join([word[0] for word in cls.name.split("_")]).upper()

        # default color is randomly picked from a list of pastel colors
        colors = [
            "#007BFF",  # Electric Blue
            "#28A745",  # Emerald Green
            "#FFC107",  # Sunflower Yellow
            "#DC3545",  # Crimson Red
            "#6F42C1",  # Royal Purple
            "#FD7E14",  # Bright Orange
            "#20C997",  # Teal
            "#E83E8C",  # Hot Pink
            "#17A2B8",  # Cyan
            "#6610F2",  # Indigo
            "#8CC63F",  # Lime Green
            "#FF00FF",  # Magenta
            "#FFD700",  # Gold
            "#FF7F50",  # Coral
            "#40E0D0",  # Turquoise
            "#00BFFF",  # Deep Sky Blue
            "#FF5522",  # Orange
            "#FA8072",  # Salmon
            "#8A2BE2",  # Violet
        ]
        color = colors[int(md5(cls.__name__.encode()).hexdigest(), 16) % len(colors)]

        return VisualTag(acronym=acronym, color=color)


class FixedOutputBaseNodeConfig(BaseNodeConfig):
    pass


class FixedOutputBaseNode(BaseNode, ABC):
    name = "fixed_output_node"
    config_model = FixedOutputBaseNodeConfig
    input_model = BaseNodeInput
    output_model = BaseNodeOutput

    @property
    @abstractmethod
    def output_schema(self) -> Dict[str, str]:
        pass

    def setup(self) -> None:
        self.output_model = self.create_output_model_class(self.output_schema)
        super().setup()

    @abstractmethod
    async def run(self, input: BaseModel) -> BaseModel:
        pass


class VariableOutputBaseNodeConfig(BaseNodeConfig):
    output_schema: Dict[str, str] = Field(
        default={"output": "str"},
        title="Output schema",
        description="The schema for the output of the node",
    )


class VariableOutputBaseNode(BaseNode, ABC):
    name = "variable_output_node"
    config_model = VariableOutputBaseNodeConfig
    input_model = BaseNodeInput
    output_model = BaseNodeOutput

    def setup(self) -> None:
        self.output_model = self.create_output_model_class(self.config.output_schema)
        super().setup()

    @abstractmethod
    async def run(self, input: BaseModel) -> BaseModel:
        pass
