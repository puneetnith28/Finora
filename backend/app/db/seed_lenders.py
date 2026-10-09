"""Configurable Demo Lender Seed Data for Finora.

NOTE: All lender thresholds and rules in this module are clearly labelled as
demonstration criteria for indicative assessment testing and NOT actual bank underwriting policies.
"""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.lender import CriterionOperator, CriterionType, Lender, LenderCriterion

DEMO_LENDERS_DATA = [
    {
        "name": "State Bank of India (SBI)",
        "description": "Demo lender criteria — Public sector bank. 8.40% Collateral, 9.40% Non-collateral (Top 100 Universities). Min CIBIL 750. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Germany,Ireland,Singapore,France",
                "required": True,
                "weight": Decimal("1.00"),
                "configuration_json": '{"disclaimer": "Demo lender criteria - For assessment demonstration only"}',
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("15000000.00"),  # Up to 1.5 Cr with collateral
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_FOIR,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("0.50"),  # 50% max FOIR
                "required": False,
                "weight": Decimal("0.80"),
            },
            {
                "criterion_type": CriterionType.MIN_CIBIL,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("750.00"),  # Min CIBIL 750
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MIN_CO_BORROWER_INCOME,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("50000.00"),
                "required": False,
                "weight": Decimal("0.70"),
            },
        ],
    },
    {
        "name": "Bank of Baroda (BOB)",
        "description": "Demo lender criteria — Public sector bank. 8.95% Collateral (Boys), 8.75% Collateral (Girls), 8.45% Non-collateral (Top 100 Universities). Min CIBIL 700. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Germany,Ireland,Singapore,France",
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("15000000.00"),  # Up to 1.5 Cr
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_FOIR,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("0.55"),
                "required": False,
                "weight": Decimal("0.80"),
            },
            {
                "criterion_type": CriterionType.MIN_CIBIL,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("700.00"),  # Min CIBIL 700
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MIN_CO_BORROWER_INCOME,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("45000.00"),
                "required": False,
                "weight": Decimal("0.70"),
            },
        ],
    },
    {
        "name": "Bank of India (BOI)",
        "description": "Demo lender criteria — Public sector bank. 9.00% Collateral (Boys), 8.60% Collateral (Girls). Non-collateral not possible. Min CIBIL 670. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Germany,Ireland,Singapore,France",
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("15000000.00"),
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.COLLATERAL_REQUIRED,
                "operator": CriterionOperator.EQ,
                "threshold_text": "true",  # BOI requires collateral
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MIN_CIBIL,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("670.00"),  # Min CIBIL 670
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_FOIR,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("0.55"),
                "required": False,
                "weight": Decimal("0.75"),
            },
        ],
    },
    {
        "name": "HDFC Credila",
        "description": "Demo lender criteria — Dedicated education loan specialist NBFC. 9.25% - 9.75% Collateral, 10.75% Non-collateral. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Germany,Ireland,Singapore,France,Netherlands,Sweden",
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("10000000.00"),  # 1 Crore
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_FOIR,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("0.60"),  # 60% FOIR ceiling
                "required": False,
                "weight": Decimal("0.80"),
            },
            {
                "criterion_type": CriterionType.MIN_CIBIL,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("680.00"),
                "required": True,
                "weight": Decimal("0.90"),
            },
            {
                "criterion_type": CriterionType.MIN_CO_BORROWER_INCOME,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("35000.00"),
                "required": False,
                "weight": Decimal("0.60"),
            },
        ],
    },
    {
        "name": "Auxilo Finserve",
        "description": "Demo lender criteria — Modern NBFC education financier. 10.00% Collateral, 10.25% Non-collateral. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Germany,Ireland,Singapore,France,Netherlands",
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("7500000.00"),  # 75 Lakhs
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_FOIR,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("0.65"),
                "required": False,
                "weight": Decimal("0.70"),
            },
            {
                "criterion_type": CriterionType.MIN_CIBIL,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("650.00"),
                "required": True,
                "weight": Decimal("0.85"),
            },
            {
                "criterion_type": CriterionType.MIN_CO_BORROWER_INCOME,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("30000.00"),
                "required": False,
                "weight": Decimal("0.60"),
            },
        ],
    },
]


def seed_demo_lenders(db: Session) -> list[Lender]:
    """Seed demo lenders and their criteria into the database if not already present."""
    seeded: list[Lender] = []
    for data in DEMO_LENDERS_DATA:
        existing = db.query(Lender).filter(Lender.name == data["name"]).first()
        if existing:
            seeded.append(existing)
            continue

        lender = Lender(
            name=data["name"],
            description=data["description"],
            active=data["active"],
        )
        db.add(lender)
        db.flush()

        for crit in data["criteria"]:
            criterion = LenderCriterion(
                lender_id=lender.id,
                criterion_type=crit["criterion_type"],
                operator=crit["operator"],
                threshold_value=crit.get("threshold_value"),
                threshold_text=crit.get("threshold_text"),
                required=crit.get("required", True),
                weight=crit.get("weight", Decimal("1.00")),
                configuration_json=crit.get("configuration_json"),
            )
            db.add(criterion)

        db.commit()
        db.refresh(lender)
        seeded.append(lender)

    return seeded
