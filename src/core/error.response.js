'use strict'

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    BAD_REQUEST: 400, // Thêm mã trạng thái cho Bad Request
    NOT_FOUND: 404 // Thêm mã NOT_FOUND
}

const ReasonStatusCode = { // Sửa lỗi chính tả
    FORBIDDEN: 'Forbidden',
    CONFLICT: 'Conflict',
    BAD_REQUEST: 'Bad Request', // Thêm thông báo cho Bad Request
    NOT_FOUND: 'Not Found' // Thêm thông báo NOT_FOUND
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class ConflictError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT) { // Sửa mã trạng thái
        super(message, statusCode);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) { // Sửa mã trạng thái và thông báo
        super(message, statusCode);
    }
}

// Thêm ForbiddenError
class ForbiddenError extends ErrorResponse {
    constructor(message = ReasonStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode);
    }
}

// Thêm NotFoundError
class NotFoundError extends ErrorResponse {
    constructor(message = ReasonStatusCode.NOT_FOUND, statusCode = StatusCode.NOT_FOUND) {
        super(message, statusCode);
    }
}

module.exports = { 
    ErrorResponse, 
    ConflictError, 
    BadRequestError, 
    ForbiddenError,
    NotFoundError
};