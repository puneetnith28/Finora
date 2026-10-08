"""Abstract interface and data transfer contracts for document extraction."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from app.models.document import DocumentType


@dataclass
class ExtractedField:
    """A single atomic extracted evidence field."""

    field_name: str
    value: Any
    confidence: float  # 0.0 to 1.0
    page_number: int = 1
    raw_text: str | None = None
    extraction_method: str = "local_parser"  # local_parser or ocr_fallback


@dataclass
class ExtractedDocumentPayload:
    """Structured evidence extracted from an uploaded document."""

    document_type: DocumentType
    fields: dict[str, ExtractedField] = field(default_factory=dict)
    confidence_score: float = 1.0
    extracted_at: str = field(
        default_factory=lambda: datetime.now(UTC).isoformat()
    )
    raw_text_length: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)

    def get_value(self, field_name: str, default: Any = None) -> Any:
        if field_name in self.fields:
            return self.fields[field_name].value
        return default

    def get_decimal(self, field_name: str, default: Decimal = Decimal("0.0")) -> Decimal:
        val = self.get_value(field_name)
        if val is None:
            return default
        try:
            # Clean currency symbols and commas
            clean_str = str(val).replace("₹", "").replace("$", "").replace("€", "").replace(",", "").strip()
            return Decimal(clean_str)
        except Exception:
            return default

    def to_dict(self) -> dict[str, Any]:
        return {
            "document_type": self.document_type.value,
            "confidence_score": self.confidence_score,
            "extracted_at": self.extracted_at,
            "raw_text_length": self.raw_text_length,
            "metadata": self.metadata,
            "fields": {
                k: {
                    "field_name": v.field_name,
                    "value": str(v.value) if isinstance(v.value, Decimal) else v.value,
                    "confidence": v.confidence,
                    "page_number": v.page_number,
                    "extraction_method": v.extraction_method,
                }
                for k, v in self.fields.items()
            },
        }


class DocumentExtractor(ABC):
    """Base interface for all specialized document extractors."""

    @abstractmethod
    def extract(self, content_text: str, raw_bytes: bytes | None = None) -> ExtractedDocumentPayload:
        """Extract structured domain fields from raw document text/bytes."""
        pass
