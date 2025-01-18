from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas.run_schemas import RunResponseSchema
from ..database import get_db
from ..models.run_model import RunModel

router = APIRouter()


@router.get(
    "/",
    response_model=List[RunResponseSchema],
    description="List all runs",
)
def list_runs(
    last_k: int = 10,
    parent_only: bool = True,
    run_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(RunModel)

    if parent_only:
        query = query.filter(RunModel.parent_run_id.is_(None))
    if run_type:
        query = query.filter(RunModel.run_type == run_type)
    runs = query.order_by(RunModel.start_time.desc()).limit(last_k).all()
    return runs


@router.get("/{run_id}/", response_model=RunResponseSchema)
def get_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(RunModel).filter(RunModel.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.get("/{run_id}/status/", response_model=RunResponseSchema)
def get_run_status(run_id: str, db: Session = Depends(get_db)):
    run = db.query(RunModel).filter(RunModel.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
