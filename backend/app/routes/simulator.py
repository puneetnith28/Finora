"""Simulator API routes for FOIR, EMI calculations, and lender impact simulation."""

from fastapi import APIRouter

from app.schemas.simulator import FoirSimulatorRequest, FoirSimulatorResponse
from app.services.simulator_service import run_foir_simulation

router = APIRouter(tags=["Simulator"])


@router.post(
    "/simulator/foir",
    response_model=FoirSimulatorResponse,
    summary="Simulate real-time loan EMI and FOIR with risk badge and capacity analysis",
)
def simulate_foir_endpoint(payload: FoirSimulatorRequest) -> FoirSimulatorResponse:
    """Instantly evaluate EMI, total debt obligations, and FOIR ratio under simulated terms."""
    return run_foir_simulation(payload)
