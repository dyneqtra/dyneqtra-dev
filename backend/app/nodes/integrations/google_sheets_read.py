from pydantic import BaseModel, Field

from ..base import BaseNode, BaseNodeConfig, BaseNodeInput, BaseNodeOutput
from app.integrations.google.client import GoogleSheetsClient


class GoogleSheetsReadNodeConfig(BaseNodeConfig):
    spreadsheet_id: str = Field("", description="The ID of the Google Spreadsheet.")
    range_name: str = Field("", description="The range to read from (e.g. 'Sheet1!A1:C10').")


class GoogleSheetsReadNodeInput(BaseNodeInput):
    pass


class GoogleSheetsReadNodeOutput(BaseNodeOutput):
    data: str = Field(..., description="The data read from the Google Sheet.")


class GoogleSheetsReadNode(BaseNode):
    """
    Node that reads data from a specified range in a Google Sheet.
    """
    name = "google_sheets_read_node"
    display_name = "GoogleSheetsRead"

    config_model = GoogleSheetsReadNodeConfig
    input_model = GoogleSheetsReadNodeInput
    output_model = GoogleSheetsReadNodeOutput

    async def run(self, input: BaseModel) -> BaseModel:
        """
        Runs the node, uses GoogleSheetsClient to read from the specified
        sheet and range, and returns the data in the output model.
        """
        sheets_client = GoogleSheetsClient()

        try:
            success, result = sheets_client.read_sheet(
                spreadsheet_id=self.config.spreadsheet_id,
                range_name=self.config.range_name,
            )

            if success:
                return GoogleSheetsReadNodeOutput(data=result)
            else:
                return GoogleSheetsReadNodeOutput(data=f"Error: {result}")

        except Exception as e:
            return GoogleSheetsReadNodeOutput(data=f"Exception occurred: {str(e)}")
