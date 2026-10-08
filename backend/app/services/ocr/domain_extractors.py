"""Domain-specific extractors for Salary Slips, Bank Statements, and Income Tax Returns (ITR)."""

import re
from decimal import Decimal

from app.models.document import DocumentType
from app.services.ocr.extractor_interface import (
    DocumentExtractor,
    ExtractedDocumentPayload,
    ExtractedField,
)


class SalarySlipExtractor(DocumentExtractor):
    """Specialized extractor for Monthly Salary Slips."""

    def extract(self, content_text: str, raw_bytes: bytes | None = None) -> ExtractedDocumentPayload:
        payload = ExtractedDocumentPayload(
            document_type=DocumentType.SALARY_SLIP,
            raw_text_length=len(content_text),
        )

        # 1. Employee Name
        name_match = re.search(
            r"(?:Employee\s*Name|Name\s*of\s*Employee|Emp\s*Name|Staff\s*Name)[:\s]+([^\r\n]+)",
            content_text,
            re.IGNORECASE,
        )
        if name_match:
            name = name_match.group(1).strip()
            payload.fields["employee_name"] = ExtractedField(
                field_name="employee_name",
                value=name,
                confidence=0.90,
                raw_text=name_match.group(0),
            )

        # 2. Employer / Company Name
        employer_match = re.search(
            r"(?:Company\s*Name|Employer|Organization)[:\s]+([^\r\n]+)",
            content_text,
            re.IGNORECASE,
        )
        if employer_match:
            emp = employer_match.group(1).strip()
            payload.fields["employer_name"] = ExtractedField(
                field_name="employer_name",
                value=emp,
                confidence=0.85,
            )
        else:
            lines = [line.strip() for line in content_text.splitlines() if line.strip()]
            for line in lines:
                if any(w in line for w in ("Pvt", "Ltd", "Corporation", "Limited", "Technologies", "LLP", "Corp", "Bank", "Inc")):
                    payload.fields["employer_name"] = ExtractedField(
                        field_name="employer_name",
                        value=line,
                        confidence=0.80,
                    )
                    break

        # 3. Gross Monthly Salary
        gross_match = re.search(
            r"(?:Gross\s*(?:Salary|Earnings|Pay|Income)|Total\s*Earnings)[:\s]*(?:Rs\.?|INR|₹|\$|€)?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if gross_match:
            val_str = gross_match.group(1).replace(",", "").strip()
            try:
                gross_val = Decimal(val_str)
                payload.fields["gross_income_monthly"] = ExtractedField(
                    field_name="gross_income_monthly",
                    value=gross_val,
                    confidence=0.95,
                    raw_text=gross_match.group(0),
                )
            except Exception:
                pass

        # 4. Net Monthly Salary
        net_match = re.search(
            r"(?:Net\s*(?:Salary|Pay|Amount|Take\s*Home))[:\s]*(?:Rs\.?|INR|₹|\$|€)?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if net_match:
            val_str = net_match.group(1).replace(",", "").strip()
            try:
                net_val = Decimal(val_str)
                payload.fields["net_income_monthly"] = ExtractedField(
                    field_name="net_income_monthly",
                    value=net_val,
                    confidence=0.95,
                    raw_text=net_match.group(0),
                )
            except Exception:
                pass

        # 5. Total Deductions (PF, TDS, Professional Tax)
        ded_match = re.search(
            r"(?:Total\s*Deductions|Deductions)[:\s]*(?:Rs\.?|INR|₹|\$|€)?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if ded_match:
            val_str = ded_match.group(1).replace(",", "").strip()
            try:
                ded_val = Decimal(val_str)
                payload.fields["total_deductions_monthly"] = ExtractedField(
                    field_name="total_deductions_monthly",
                    value=ded_val,
                    confidence=0.85,
                )
            except Exception:
                pass

        # 6. Pay Date / Month
        date_match = re.search(
            r"(?:Date\s*of\s*Payment|Payment\s*Date|Pay\s*Date)[:\s]*([^\r\n]+)",
            content_text,
            re.IGNORECASE,
        )
        if not date_match:
            date_match = re.search(
                r"(?:Salary\s*Month|Period|For\s*the\s*month\s*of)[:\s]*([^\r\n]+)",
                content_text,
                re.IGNORECASE,
            )
        if date_match:
            p_date = date_match.group(1).strip()
            payload.fields["pay_date"] = ExtractedField(
                field_name="pay_date",
                value=p_date,
                confidence=0.90,
            )


        return payload


class BankStatementExtractor(DocumentExtractor):
    """Specialized extractor for 6-Month Bank Statements."""

    def extract(self, content_text: str, raw_bytes: bytes | None = None) -> ExtractedDocumentPayload:
        payload = ExtractedDocumentPayload(
            document_type=DocumentType.BANK_STATEMENT,
            raw_text_length=len(content_text),
        )

        # 1. Account Holder Name
        holder_match = re.search(
            r"(?:Account\s*Name|Customer\s*Name|Account\s*Holder|Name)[:\s]+([^\r\n]+)",
            content_text,
            re.IGNORECASE,
        )
        if holder_match:
            holder = holder_match.group(1).strip()
            payload.fields["account_holder_name"] = ExtractedField(
                field_name="account_holder_name",
                value=holder,
                confidence=0.90,
            )

        # 2. Account Number
        acc_match = re.search(
            r"(?:Account\s*(?:No|Number|#)|A/C\s*No)[:\s]*([0-9A-Za-z]+)",
            content_text,
            re.IGNORECASE,
        )
        if acc_match:
            acc_num = acc_match.group(1).strip()
            payload.fields["account_number"] = ExtractedField(
                field_name="account_number",
                value=acc_num,
                confidence=0.95,
            )

        # 3. Total Credits (Deposits / Inflows)
        credits_match = re.search(
            r"(?:Total\s*Credits|Total\s*Deposits|Sum\s*of\s*Credits)[:\s]*(?:Rs\.?|INR|₹|\$|€)?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if credits_match:
            val_str = credits_match.group(1).replace(",", "").strip()
            try:
                credits_val = Decimal(val_str)
                payload.fields["total_credits"] = ExtractedField(
                    field_name="total_credits",
                    value=credits_val,
                    confidence=0.90,
                )
            except Exception:
                pass

        # 4. Total Debits (Outflows)
        debits_match = re.search(
            r"(?:Total\s*Debits|Total\s*Withdrawals|Sum\s*of\s*Debits)[:\s]*(?:Rs\.?|INR|₹|\$|€)?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if debits_match:
            val_str = debits_match.group(1).replace(",", "").strip()
            try:
                debits_val = Decimal(val_str)
                payload.fields["total_debits"] = ExtractedField(
                    field_name="total_debits",
                    value=debits_val,
                    confidence=0.90,
                )
            except Exception:
                pass

        # 5. Average Monthly Balance
        avg_bal_match = re.search(
            r"(?:Average\s*(?:Monthly\s*)?Balance|AMB|Average\s*Quarterly\s*Balance|Closing\s*Balance)[:\s]*(?:Rs\.?|INR|₹|\$|€)?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if avg_bal_match:
            val_str = avg_bal_match.group(1).replace(",", "").strip()
            try:
                avg_val = Decimal(val_str)
                payload.fields["average_balance"] = ExtractedField(
                    field_name="average_balance",
                    value=avg_val,
                    confidence=0.88,
                )
            except Exception:
                pass

        # 6. Statement Period
        period_match = re.search(
            r"(?:Statement\s*Period|Period\s*From|From\s*Date)[:\s]*([^\r\n]+)",
            content_text,
            re.IGNORECASE,
        )
        if period_match:
            period = period_match.group(1).strip()
            payload.fields["statement_period"] = ExtractedField(
                field_name="statement_period",
                value=period,
                confidence=0.85,
            )

        # 7. Transaction Count
        txn_match = re.search(
            r"(?:Total\s*Transactions|Transaction\s*Count)[:\s]*([0-9]+)",
            content_text,
            re.IGNORECASE,
        )
        if txn_match:
            try:
                tx_count = int(txn_match.group(1).strip())
                payload.fields["transaction_count"] = ExtractedField(
                    field_name="transaction_count",
                    value=tx_count,
                    confidence=0.90,
                )
            except Exception:
                pass

        return payload



class ITRExtractor(DocumentExtractor):
    """Narrow, high-precision extractor for Indian Income Tax Return (ITR-V) forms."""

    def extract(self, content_text: str, raw_bytes: bytes | None = None) -> ExtractedDocumentPayload:
        payload = ExtractedDocumentPayload(
            document_type=DocumentType.ITR,
            raw_text_length=len(content_text),
        )

        # 1. Taxpayer Name
        name_match = re.search(
            r"(?:Name\s*of\s*the\s*Assessee|Name|Assessee\s*Name)[:\s]+([A-Za-z\s\.]+)",
            content_text,
            re.IGNORECASE,
        )
        if name_match:
            name = name_match.group(1).strip().split("\n")[0]
            payload.fields["taxpayer_name"] = ExtractedField(
                field_name="taxpayer_name",
                value=name,
                confidence=0.92,
            )

        # 2. PAN Number (Standard 10-char Indian PAN: 5 letters, 4 digits, 1 letter)
        pan_match = re.search(
            r"(?:PAN|Permanent\s*Account\s*Number)[:\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})",
            content_text,
            re.IGNORECASE,
        )
        if pan_match:
            pan = pan_match.group(1).upper()
            payload.fields["pan_number"] = ExtractedField(
                field_name="pan_number",
                value=pan,
                confidence=0.99,
            )

        # 3. Assessment Year
        ay_match = re.search(
            r"(?:Assessment\s*Year|AY)[:\s]*([0-9]{4}\s*-\s*[0-9]{2,4})",
            content_text,
            re.IGNORECASE,
        )
        if ay_match:
            ay = ay_match.group(1).replace(" ", "")
            payload.fields["assessment_year"] = ExtractedField(
                field_name="assessment_year",
                value=ay,
                confidence=0.95,
            )

        # 4. Gross Total Income (Annual INR)
        gti_match = re.search(
            r"(?:Gross\s*Total\s*Income|Total\s*Income|Gross\s*Income)[:\s]*[₹$€]?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if gti_match:
            val_str = gti_match.group(1).replace(",", "").strip()
            try:
                gti_val = Decimal(val_str)
                payload.fields["gross_total_income"] = ExtractedField(
                    field_name="gross_total_income",
                    value=gti_val,
                    confidence=0.95,
                )
                # Derived monthly gross income
                payload.fields["derived_monthly_income"] = ExtractedField(
                    field_name="derived_monthly_income",
                    value=(gti_val / Decimal("12.0")).quantize(Decimal("0.01")),
                    confidence=0.95,
                )
            except Exception:
                pass

        # 5. Total Tax Paid / Taxes Remitted
        tax_match = re.search(
            r"(?:Total\s*Tax\s*Paid|Taxes\s*Paid|Net\s*Tax\s*Payable)[:\s]*[₹$€]?\s*([0-9,]+(?:\.[0-9]{2})?)",
            content_text,
            re.IGNORECASE,
        )
        if tax_match:
            val_str = tax_match.group(1).replace(",", "").strip()
            try:
                tax_val = Decimal(val_str)
                payload.fields["total_tax_paid"] = ExtractedField(
                    field_name="total_tax_paid",
                    value=tax_val,
                    confidence=0.90,
                )
            except Exception:
                pass

        # 6. E-Filing Acknowledgment Number
        ack_match = re.search(
            r"(?:Acknowledgement\s*Number|Ack\s*No|E-Filing\s*Ack)[:\s]*([0-9]{10,20})",
            content_text,
            re.IGNORECASE,
        )
        if ack_match:
            ack = ack_match.group(1).strip()
            payload.fields["acknowledgment_number"] = ExtractedField(
                field_name="acknowledgment_number",
                value=ack,
                confidence=0.98,
            )

        return payload


def get_extractor_for_document_type(doc_type: DocumentType) -> DocumentExtractor:
    """Factory function returning the appropriate domain extractor."""
    if doc_type == DocumentType.SALARY_SLIP:
        return SalarySlipExtractor()
    elif doc_type == DocumentType.BANK_STATEMENT:
        return BankStatementExtractor()
    elif doc_type == DocumentType.ITR:
        return ITRExtractor()
    else:
        # Default fallback extractor
        return SalarySlipExtractor()
