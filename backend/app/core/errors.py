"""Standardized Error Handlers and JSON Response format."""

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


class ErrorDetails(BaseModel):
    code: str = Field(..., description="Machine readable error code")
    message: str = Field(..., description="Human readable error message")
    fields: dict[str, str] = Field(
        default_factory=dict, description="Field-level validation error messages"
    )


class StandardErrorResponse(BaseModel):
    error: ErrorDetails


def register_error_handlers(app: FastAPI) -> None:
    """Register uniform JSON error formatting across all application exception types."""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        fields: dict[str, str] = {}
        primary_msg = "Validation error"

        for err in exc.errors():
            loc = err.get("loc", [])
            # Filter out 'body' or top-level location if present
            clean_loc = [str(x) for x in loc if str(x) not in ("body", "query", "path")]
            field_name = ".".join(clean_loc) if clean_loc else "payload"
            msg = err.get("msg", "Invalid value")
            fields[field_name] = msg
            if primary_msg == "Validation error":
                primary_msg = msg

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": primary_msg,
                    "fields": fields,
                }
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "UNPROCESSABLE_ENTITY",
            500: "INTERNAL_SERVER_ERROR",
        }
        err_code = code_map.get(exc.status_code, "HTTP_ERROR")

        message = str(exc.detail) if isinstance(exc.detail, str) else "HTTP Exception"
        fields: dict[str, Any] = exc.detail if isinstance(exc.detail, dict) else {}

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": err_code,
                    "message": message,
                    "fields": fields,
                }
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred.",
                    "fields": {},
                }
            },
        )
