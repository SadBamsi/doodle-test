export interface IMessage {
  _id: string;
  message: string;
  author: string;
  createdAt: string | Date;
}

export interface CreateMessageRequest {
  message: string;
  author: string;
}

export interface IDetails {
  msg: string;
  param: string;
  location: string;
}

export interface IErrorResponse {
  error: string;
}

export interface IntervalServerError {
  error: {
    message: string;
    createdAt: string | Date;
  };
}
