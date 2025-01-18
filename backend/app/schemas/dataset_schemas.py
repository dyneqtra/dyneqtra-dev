from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class DatasetResponseSchema(BaseModel):
    id: str
    name: str
    description: Optional[str]
    filename: str
    created_at: datetime
    updated_at: datetime


class DatasetListResponseSchema(BaseModel):
    datasets: list[DatasetResponseSchema]
