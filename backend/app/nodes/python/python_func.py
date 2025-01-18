from typing import Dict, Any

from pydantic import BaseModel

from ..base import (
    VariableOutputBaseNode,
    VariableOutputBaseNodeConfig,
    BaseNodeInput,
    BaseNodeOutput,
)


class PythonFuncNodeConfig(VariableOutputBaseNodeConfig):
    code: str = "\n".join(
        [
            "# Write your Python code here.",
            '# The input data is available as "input" pydantic model.',
            "# Return a dictionary of variables that you would like to see in the node output.",
        ]
    )


class PythonFuncNodeInput(BaseNodeInput):
    pass


class PythonFuncNodeOutput(BaseNodeOutput):
    pass


class PythonFuncNode(VariableOutputBaseNode):
    """
    Node type for executing Python code on the input data.
    """

    name = "python_func_node"
    display_name = "Python Function"
    config_model = PythonFuncNodeConfig
    input_model = PythonFuncNodeInput
    output_model = PythonFuncNodeOutput

    def setup(self) -> None:
        return super().setup()

    async def run(self, input: BaseModel) -> BaseModel:
        # Prepare the execution environment
        exec_globals: Dict[str, Any] = {}
        exec_locals: Dict[str, Any] = {}

        # Indent user code properly
        code_body = "\n".join("    " + line for line in self.config.code.split("\n"))

        # Build the code to execute
        function_code = f"def user_function(input_model):\n{code_body}\n"

        # Execute the user-defined function code
        exec(function_code, exec_globals, exec_locals)

        # Call the user-defined function and retrieve the output
        output_data = exec_locals["user_function"](input)
        return self.output_model.model_validate(output_data)


if __name__ == "__main__":
    from pydantic import BaseModel, create_model
    import asyncio

    config = PythonFuncNodeConfig(
        code="\n".join(
            [
                "# Write your Python code here.",
                '# The input data is available as "input_model" pydantic model.',
                "# Return a dictionary of variables that you would like to see in the node output.",
                "output = input_model.Input.number ** 2",
                "return {'output': output}",
            ]
        ),
        output_schema={"output": "int"},
    )
    A = create_model(
        "Input", number=(int, ...), __base__=BaseNodeOutput
    ).model_validate({"number": 5})
    input = {"Input": A}
    node = PythonFuncNode(config=config, name="PythonFuncTest")

    output = asyncio.run(node(input))
    print(output)
