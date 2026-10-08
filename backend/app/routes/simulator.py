from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.simulator import (
    FoirSimulatorRequest,
    FoirSimulatorResponse,
    LenderImpactSimRequest,
    LenderImpactSimResponse,
)
from app.services.simulator_service import run_foir_simulation, simulate_lender_impact

router = APIRouter(tags=["Simulator"])


@router.post(
    "/simulator/foir",
    response_model=FoirSimulatorResponse,
    summary="Simulate real-time loan EMI and FOIR with risk badge and capacity analysis",
)
def simulate_foir_endpoint(payload: FoirSimulatorRequest) -> FoirSimulatorResponse:
    """Instantly evaluate EMI, total debt obligations, and FOIR ratio under simulated terms."""
    return run_foir_simulation(payload)


@router.post(
    "/simulator/lender-impact",
    response_model=LenderImpactSimResponse,
    summary="Simulate real-time lender match transitions when loan amount, tenure, and FOIR change",
)
def simulate_lender_impact_endpoint(
    payload: LenderImpactSimRequest,
    db: Session = Depends(get_db),
) -> LenderImpactSimResponse:
    """Compare baseline vs simulated applicant terms and evaluate lender eligibility deltas."""
    return simulate_lender_impact(db, payload)

