import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

interface NormalizedError {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
}

// Normalizes every thrown error to the shape documented in API_SPEC.md so the
// frontend never has to parse an ad hoc error shape.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = this.normalize(exception);

    if (body.statusCode >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(body.statusCode).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const statusCode = exception.getStatus();
      if (typeof response === "string") {
        return {
          statusCode,
          message: response,
          errorCode: exception.name,
        };
      }
      const responseObj = response as Record<string, unknown>;
      return {
        statusCode,
        message: (responseObj.message as string) ?? exception.message,
        errorCode: (responseObj.error as string) ?? exception.name,
        details: responseObj.message !== responseObj.error ? responseObj : undefined,
      };
    }

    // Never leak raw stack traces or Mongoose error internals to the client —
    // see SECURITY.md "Input & File Validation".
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred.",
      errorCode: "INTERNAL_SERVER_ERROR",
    };
  }
}
