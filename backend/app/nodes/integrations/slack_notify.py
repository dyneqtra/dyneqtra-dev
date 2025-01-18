import json
from pydantic import BaseModel, Field
from ..base import BaseNode, BaseNodeConfig, BaseNodeInput, BaseNodeOutput
from ...integrations.slack.client import SlackClient
from enum import Enum

class ModeEnum(str, Enum):
    BOT = "bot"
    USER = "user"

class SlackNotifyNodeConfig(BaseNodeConfig):
    channel: str = Field("", description="The channel ID to send the message to.")
    mode: ModeEnum = Field(ModeEnum.BOT, description="The mode to send the message in. Can be 'bot' or 'user'.")
    
class SlackNotifyNodeInput(BaseNodeInput):
    message: str = Field(..., description="The message to send to the Slack channel.")

class SlackNotifyNodeOutput(BaseNodeOutput):
    status: str = Field(..., description="Error message if the message was not sent successfully.")

class SlackNotifyNode(BaseNode):
    name = "slack_notify_node"
    display_name = "SlackNotify"
    logo="/images/slack.png"

    config_model = SlackNotifyNodeConfig
    input_model = SlackNotifyNodeInput
    output_model = SlackNotifyNodeOutput

    async def run(self, input: BaseModel) -> BaseModel:
        """
        Sends a message to the specified Slack channel.
        """
        
        # convert data to a string and send it to the Slack channel
        message = json.dumps(input.model_dump())

        client = SlackClient()
        ok, status = client.send_message(channel=self.config.channel, text=message, mode=self.config.mode) # type: ignore
        return SlackNotifyNodeOutput(status=status)

if __name__ == "__main__":
    import asyncio

    async def main():
        # Example usage
        node = SlackNotifyNode(
        name="slack_node",  # Add the missing 'name' parameter
        config=SlackNotifyNodeConfig(mode=ModeEnum.BOT, channel="#integrations")
    )
        input_data = SlackNotifyNodeInput(message="Hello from the SlackNode!")
        output = await node.run(input_data)
        print(output)

    asyncio.run(main())