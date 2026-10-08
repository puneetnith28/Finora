"""Configurable Demo Lender Seed Data for Finora.

NOTE: All lender thresholds and rules in this module are clearly labelled as
demonstration criteria for indicative assessment testing and NOT actual bank underwriting policies.
"""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.lender import CriterionOperator, CriterionType, Lender, LenderCriterion

DEMO_LENDERS_DATA = [
    {
        "name": "Demo Global Education Bank (Tier 1)",
        "description": "Demo lender criteria — Tier 1 global unsecured & secured loans. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Germany",
                "required": True,
                "weight": Decimal("1.00"),
                "configuration_json": '{"disclaimer": "Demo lender criteria - For assessment demonstration only"}',
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
                "threshold_value": Decimal("0.50"),  # 50%
                "required": False,
                "weight": Decimal("0.80"),
            },
            {
                "criterion_type": CriterionType.MIN_CIBIL,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("720.00"),
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MIN_CO_BORROWER_INCOME,
                "operator": CriterionOperator.GTE,
                "threshold_value": Decimal("60000.00"),
                "required": False,
                "weight": Decimal("0.70"),
            },
        ],
    },
    {
        "name": "Demo Prime NBFC (USA / STEM Specialist)",
        "description": "Demo lender criteria — Specialised in USA STEM graduate degrees. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA",
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
                "threshold_value": Decimal("0.60"),
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
                "threshold_value": Decimal("40000.00"),
                "required": False,
                "weight": Decimal("0.60"),
            },
        ],
    },
    {
        "name": "Demo Secured Value Bank",
        "description": "Demo lender criteria — High ticket secured lending backed by property. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,Singapore,Germany,Ireland",
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("15000000.00"),  # 1.5 Crore
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.COLLATERAL_REQUIRED,
                "operator": CriterionOperator.EQ,
                "threshold_text": "true",
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
        ],
    },
    {
        "name": "Demo Flexible Study Credit",
        "description": "Demo lender criteria — Flexible digital credit for global programs. For assessment demonstration only.",
        "active": True,
        "criteria": [
            {
                "criterion_type": CriterionType.TARGET_COUNTRY,
                "operator": CriterionOperator.IN,
                "threshold_text": "USA,UK,Canada,Australia,India,Germany,France",
                "required": True,
                "weight": Decimal("1.00"),
            },
            {
                "criterion_type": CriterionType.MAX_LOAN_AMOUNT,
                "operator": CriterionOperator.LTE,
                "threshold_value": Decimal("4000000.00"),  # 40 Lakhs
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
                "weight": Decimal("0.90"),
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
