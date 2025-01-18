from pydantic import BaseModel
from datetime import datetime


class OutputFileResponseSchema(BaseModel):
    id: str
    file_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OutputFileCreateSchema(BaseModel):
    run_id: str
    file_name: str
    file_path: str


class OutputFileUpdateSchema(BaseModel):
    id: str

    class Config:
        from_attributes = True
