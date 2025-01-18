const testInput = {
    name: 'Weather and Jokes',
    definition: {
        description: 'This workflow will provide the user with the average annual weather for a city and a joke',
    },
    workflow: {
        nodes: [
            {
                id: '1',
                node_type: 'AdvancedLLMNode',
                config: {
                    llm_name: 'gpt-4o',
                    max_tokens: 150,
                    temperature: 0.7,
                    system_prompt: 'please provide average annual weather for {city}',
                    output_schema: {
                        city: 'str',
                        weather: 'str',
                        temperature: 'float',
                        humidity: 'int',
                        feels_like: 'float',
                        precipitation: 'float',
                    },
                    input_schema: { user_message: 'str', city: 'str', units: 'str' },
                },
            },
            {
                id: '3',
                node_type: 'BestOfNNode',
                config: {
                    llm_name: 'gpt-4o',
                    max_tokens: 150,
                    temperature: 0.7,
                    system_prompt: 'please provide average annual weather for {city} in {units}',
                    output_schema: {
                        general_weather_guidelines: 'str',
                        average_annual_temperature: 'float',
                    },
                    input_schema: { user_message: 'str', city: 'str', units: 'str' },
                    samples: 5,
                },
            },
            {
                id: '2',
                node_type: 'PythonFuncNode',
                config: {
                    code: "import time\ntime.sleep(1)\noutput_data = {'result': input_data['number'] * 2}",
                    input_schema: {
                        number: 'float',
                    },
                    output_schema: {
                        result: 'float',
                    },
                },
            },
            {
                id: '4',
                node_type: 'MCTSNode',
                config: {
                    llm_name: 'gpt-4o',
                    max_tokens: 2048,
                    temperature: 0.7,
                    system_prompt:
                        "You are Jimmy Carr. Your jokes are punchy, funny and politically incorrect. Your task is to create a joke for the user's instruction",
                    num_simulations: 5,
                    simulation_depth: 10,
                },
            },
            {
                id: '5',
                node_type: 'BranchSolveMergeNode',
                config: {
                    llm_name: 'gpt-4o',
                    max_tokens: 2048,
                    temperature: 0.7,
                    input_schema: { user_message: 'str' },
                    output_schema: { complete_joke: 'str' },
                },
            },
        ],
        links: [
            {
                source_id: '1',
                source_output_key: 'temperature',
                target_id: '2',
                target_input_key: 'number',
            },
        ],
    },
}

export default testInput
