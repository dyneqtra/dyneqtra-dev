import asyncio
import os
import json
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pathlib import Path  # Import Path for directory handling
from typing import Awaitable, Dict, Any, List, Optional

from ..schemas.run_schemas import (
    StartRunRequestSchema,
    RunResponseSchema,
    PartialRunRequestSchema,
    BatchRunRequestSchema,
)
from ..schemas.workflow_schemas import WorkflowDefinitionSchema
from ..database import get_db
from ..models.workflow_model import WorkflowModel as WorkflowModel
from ..models.run_model import RunModel as RunModel, RunStatus
from ..models.task_model import TaskStatus
from ..models.dataset_model import DatasetModel
from ..models.output_file_model import OutputFileModel
from ..execution.workflow_executor import WorkflowExecutor
from ..dataset.ds_util import get_ds_iterator, get_ds_column_names
from ..execution.task_recorder import TaskRecorder
from ..utils.workflow_version_utils import fetch_workflow_version
from ..execution.workflow_execution_context import WorkflowExecutionContext

router = APIRouter()

# Define EVALS_DIR (same as in evals_management.py)
EVALS_DIR = Path(__file__).parent.parent / "evals" / "tasks"


async def create_run_model(
    workflow_id: str,
    workflow_version_id: str,
    initial_inputs: Dict[str, Dict[str, Any]],
    parent_run_id: Optional[str],
    run_type: str,
    db: Session,
) -> RunModel:
    new_run = RunModel(
        workflow_id=workflow_id,
        workflow_version_id=workflow_version_id,
        status=RunStatus.PENDING,
        initial_inputs=initial_inputs,
        start_time=datetime.now(timezone.utc),
        parent_run_id=parent_run_id,
        run_type=run_type,
    )
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    return new_run


@router.post(
    "/{workflow_id}/run/",
    response_model=Dict[str, Any],
    description="Run a workflow and return the outputs",
)
async def run_workflow_blocking(
    workflow_id: str,
    request: StartRunRequestSchema,
    db: Session = Depends(get_db),
    run_type: str = "interactive",
) -> Dict[str, Any]:
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_version = fetch_workflow_version(workflow_id, workflow, db)

    initial_inputs = request.initial_inputs or {}
    new_run = await create_run_model(
        workflow_id,
        workflow_version.id,
        initial_inputs,
        request.parent_run_id,
        run_type,
        db,
    )
    task_recorder = TaskRecorder(db, new_run.id)
    workflow_definition = WorkflowDefinitionSchema.model_validate(
        workflow_version.definition
    )
    context = WorkflowExecutionContext(
        workflow_id=workflow.id,
        run_id=new_run.id,
        parent_run_id=request.parent_run_id,
        run_type=run_type,
        db_session=db,
    )
    executor = WorkflowExecutor(
        workflow=workflow_definition,
        task_recorder=task_recorder,
        context=context,
    )
    input_node = next(
        node for node in workflow_definition.nodes if node.node_type == "InputNode"
    )
    outputs = await executor(initial_inputs[input_node.id])
    new_run.status = RunStatus.COMPLETED
    new_run.end_time = datetime.now(timezone.utc)
    new_run.outputs = {k: v.model_dump() for k, v in outputs.items()}
    db.commit()
    return outputs


@router.post(
    "/{workflow_id}/start_run/",
    response_model=RunResponseSchema,
    description="Start a non-blocking workflow run and return the run details",
)
async def run_workflow_non_blocking(
    workflow_id: str,
    start_run_request: StartRunRequestSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    run_type: str = "interactive",
) -> RunResponseSchema:
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_version = fetch_workflow_version(workflow_id, workflow, db)

    workflow_definition = WorkflowDefinitionSchema.model_validate(
        workflow_version.definition
    )
    initial_inputs = start_run_request.initial_inputs or {}
    new_run = await create_run_model(
        workflow_id,
        workflow_version.id,
        initial_inputs,
        start_run_request.parent_run_id,
        run_type,
        db,
    )

    async def run_workflow_task(
        run_id: str, workflow_definition: WorkflowDefinitionSchema
    ):
        with next(get_db()) as session:
            run = session.query(RunModel).filter(RunModel.id == run_id).first()
            if not run:
                session.close()
                return
            run.status = RunStatus.RUNNING
            session.commit()
            task_recorder = TaskRecorder(db, run_id)
            context = WorkflowExecutionContext(
                workflow_id=run.workflow_id,
                run_id=run_id,
                parent_run_id=start_run_request.parent_run_id,
                run_type=run_type,
                db_session=session,
            )
            executor = WorkflowExecutor(
                workflow=workflow_definition,
                task_recorder=task_recorder,
                context=context,
            )
            try:
                assert run.initial_inputs
                input_node = next(
                    node
                    for node in workflow_definition.nodes
                    if node.node_type == "InputNode"
                )
                outputs = await executor(run.initial_inputs[input_node.id])
                run.outputs = {k: v.model_dump() for k, v in outputs.items()}
                run.status = RunStatus.COMPLETED
                run.end_time = datetime.now(timezone.utc)
            except Exception as e:
                run.status = RunStatus.FAILED
                run.end_time = datetime.now(timezone.utc)
                raise e
            session.commit()

    background_tasks.add_task(run_workflow_task, new_run.id, workflow_definition)

    return new_run


@router.post(
    "/{workflow_id}/run_partial/",
    response_model=Dict[str, Any],
    description="Run a partial workflow and return the outputs",
)
async def run_partial_workflow(
    workflow_id: str, request: PartialRunRequestSchema, db: Session = Depends(get_db)
) -> Dict[str, Any]:
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow_definition = WorkflowDefinitionSchema.model_validate(workflow.definition)
    executor = WorkflowExecutor(workflow_definition)
    input_node = next(
        node for node in workflow_definition.nodes if node.node_type == "InputNode"
    )
    initial_inputs = request.initial_inputs or {}
    try:
        outputs = await executor.run(
            input=initial_inputs.get(input_node.id, {}),
            node_ids=[request.node_id],
            precomputed_outputs=request.partial_outputs or {},
        )
        return outputs
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/{workflow_id}/start_batch_run/",
    response_model=RunResponseSchema,
    description="Start a batch run of a workflow over a dataset and return the run details",
)
async def batch_run_workflow_non_blocking(
    workflow_id: str,
    request: BatchRunRequestSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> RunResponseSchema:
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_version = fetch_workflow_version(workflow_id, workflow, db)

    dataset_id = request.dataset_id
    new_run = await create_run_model(
        workflow_id, workflow_version.id, {}, None, "batch", db
    )

    # parse the dataset
    dataset = db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # ensure ds columns match workflow inputs
    dataset_columns = get_ds_column_names(dataset.file_path)
    workflow_definition = WorkflowDefinitionSchema.model_validate(
        workflow_version.definition
    )
    input_node = next(
        node for node in workflow_definition.nodes if node.node_type == "InputNode"
    )
    input_node_id = input_node.id
    workflow_input_schema: Dict[str, str] = input_node.config["input_schema"]
    for col in workflow_input_schema.keys():
        if col not in dataset_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Input field '{col}' in input schema not found in the dataset",
            )

    # create output file
    output_file_name = f"output_{new_run.id}.jsonl"
    output_file_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "output_files", output_file_name
    )
    output_file = OutputFileModel(
        file_name=output_file_name,
        file_path=output_file_path,
    )
    db.add(output_file)
    db.commit()

    file_path = dataset.file_path

    mini_batch_size = request.mini_batch_size

    async def start_mini_batch_runs(
        file_path: str,
        workflow_id: str,
        workflow_input_schema: Dict[str, str],
        input_node_id: str,
        parent_run_id: str,
        background_tasks: BackgroundTasks,
        db: Session,
        mini_batch_size: int,
        output_file_path: str,
    ):
        ds_iter = get_ds_iterator(file_path)
        current_batch: List[Awaitable[Dict[str, Any]]] = []
        batch_count = 0
        for inputs in ds_iter:
            initial_inputs = {
                input_node_id: {
                    k: v for k, v in inputs.items() if k in workflow_input_schema
                }
            }
            single_input_run_task = run_workflow_blocking(
                workflow_id=workflow_id,
                request=StartRunRequestSchema(
                    initial_inputs=initial_inputs, parent_run_id=parent_run_id
                ),
                db=db,
                run_type="batch",
            )
            current_batch.append(single_input_run_task)
            if len(current_batch) == mini_batch_size:
                minibatch_results = await asyncio.gather(*current_batch)
                current_batch = []
                batch_count += 1
                with open(output_file_path, "a") as output_file:
                    for output in minibatch_results:
                        output = {
                            node_id: output.model_dump()
                            for node_id, output in output.items()
                        }
                        output_file.write(json.dumps(output) + "\n")

        if current_batch:
            results = await asyncio.gather(*current_batch)
            with open(output_file_path, "a") as output_file:
                for output in results:
                    output = {
                        node_id: output.model_dump()
                        for node_id, output in output.items()
                    }
                    output_file.write(json.dumps(output) + "\n")

        with next(get_db()) as session:
            run = session.query(RunModel).filter(RunModel.id == parent_run_id).first()
            if not run:
                session.close()
                return
            run.status = RunStatus.COMPLETED
            run.end_time = datetime.now(timezone.utc)
            session.commit()

    background_tasks.add_task(
        start_mini_batch_runs,
        file_path,
        workflow_id,
        workflow_input_schema,
        input_node_id,
        new_run.id,
        background_tasks,
        db,
        mini_batch_size,
        output_file_path,
    )
    new_run.output_file_id = output_file.id
    db.commit()
    return new_run


@router.get(
    "/{workflow_id}/runs/",
    response_model=List[RunResponseSchema],
    description="List all runs of a workflow",
)
def list_runs(workflow_id: str, db: Session = Depends(get_db)):
    runs = (
        db.query(RunModel)
        .filter(RunModel.workflow_id == workflow_id)
        .order_by(RunModel.start_time.desc())
        .all()
    )

    # Update run status based on task status
    for run in runs:
        if (
            run.status != RunStatus.FAILED
        ):  # Only check if run isn't already marked as failed
            failed_tasks = [
                task for task in run.tasks if task.status == TaskStatus.FAILED
            ]
            if failed_tasks:
                run.status = RunStatus.FAILED
                db.commit()
                db.refresh(run)

    return runs
