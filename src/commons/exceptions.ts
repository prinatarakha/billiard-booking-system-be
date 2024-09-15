import { ErrorResponse } from "./response";

export class NotFoundResponse extends ErrorResponse {
  constructor(message: Error | string | unknown = "Resource not found") {
    super(404, message?.toString() ?? "Resource not found");
  }
}

export class InternalServerErrorResponse extends ErrorResponse {
  constructor(message: Error | string | unknown = "Internal Server Error") {
    super(500, message?.toString() ?? "Internal Server Error");
  }
}

export class UnauthenticatedResponse extends ErrorResponse {
  constructor(message: Error | string | unknown = "Unauthenticated") {
    super(401, message?.toString() ?? "Unauthenticated");
  }
}

export class UnauthorizedResponse extends ErrorResponse {
  constructor(message: Error | string | unknown = "Unauthorized") {
    super(403, message?.toString() ?? "Unauthorized");
  }
}

export class BadRequestResponse extends ErrorResponse {
  constructor(message: Error | string | unknown = "Bad Request") {
    super(400, message?.toString() ?? "Bad Request");
  }
}

export class UnprocessableEntityResponse extends ErrorResponse {
  constructor(message: Error | string | unknown = "Unprocessable Entity") {
    super(422, message?.toString() ?? "Unprocessable Entity");
  }
}