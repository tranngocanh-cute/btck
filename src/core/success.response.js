"use-strict";

const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  CREATED: "Created",
  OK: "Success",
};
class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reponseCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.status = statusCode;
    this.message = !message ? reponseCode : message;
    this.metadata = metadata;
  }
  send(res, headers = {}) {
    return res.status(this.status).json({
      message: this.message,
      code: this.status,
      metadata: this.metadata,
    });
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata = {},  statusCode = StatusCode.CREATED, reponseCode = ReasonStatusCode.CREATED,}) {
    super({
      message,
      metadata,
      statusCode,
      reponseCode
    });
  }
}
class CREATED extends SuccessResponse {
  constructor({ options = {},message, metadata = {}, statusCode = StatusCode.CREATED, reponseCode = ReasonStatusCode.CREATED, }) {
    super({
      message,
      metadata,
      statusCode,
      reponseCode
    });
    this.options = options
  }
}

module.exports = { OK, CREATED };
