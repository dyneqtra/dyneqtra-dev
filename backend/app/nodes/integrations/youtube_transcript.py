from pydantic import BaseModel, Field
from ..base import BaseNode, BaseNodeConfig, BaseNodeInput, BaseNodeOutput
from phi.tools.youtube_tools import YouTubeTools

import logging

class YouTubeTranscriptNodeConfig(BaseNodeConfig):
    video_url: str = Field("", description="The YouTube video url to fetch the transcript for.")

class YouTubeTranscriptNodeInput(BaseNodeInput):
    pass

class YouTubeTranscriptNodeOutput(BaseNodeOutput):
    transcript: str = Field(..., description="The transcript of the video.")

class YouTubeTranscriptNode(BaseNode):
    name = "youtube_transcript_node"
    display_name = "YouTubeTranscript"

    config_model = YouTubeTranscriptNodeConfig
    input_model = YouTubeTranscriptNodeInput
    output_model = YouTubeTranscriptNodeOutput

    async def run(self, input: BaseModel) -> BaseModel:
        """
        Fetches the transcript for a given YouTube video ID and languages.
        """
        try:
            yt = YouTubeTools()
            transcript: str = yt.get_youtube_video_captions(url=self.config.video_url)
            return YouTubeTranscriptNodeOutput(transcript=transcript)
        except Exception as e:
            logging.error(f"Failed to get transcript: {e}")
            return YouTubeTranscriptNodeOutput(transcript="")
        
if __name__ == "__main__":
    import asyncio

    async def main():
        node = YouTubeTranscriptNode(
            name="youtube_transcript_node",
            config=YouTubeTranscriptNodeConfig(video_url="https://www.youtube.com/watch?v=9bZkp7q19f0")
        )
        input_data = YouTubeTranscriptNodeInput()
        output = await node.run(input_data)
        print(output)

    asyncio.run(main())
        
