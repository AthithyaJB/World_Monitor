from fastapi import APIRouter, BackgroundTasks
from app.models.schemas import IngestTriggerRequest
from app.ingestion.orchestrator import run_ingestion

router = APIRouter()


@router.post("/trigger")
async def trigger_ingestion(
    request: IngestTriggerRequest,
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(run_ingestion, request.job_type)
    return {"status": "accepted", "job_type": request.job_type}
