export interface IMessage {
  _id: string;
  message: string;
  author: string;
  createdAt: string | Date;
}

export interface IGetMessagesRequest {
  limit?: number;
  before?: string;
  after?: string;
}

export interface IMessagesPagination {
  limit: number;
  hasOlder: boolean;
  hasNewer: boolean;
  nextBefore: string | null;
  nextAfter: string | null;
}

export interface IMessagesResult {
  messages: IMessage[];
  pagination: IMessagesPagination;
  filters: {
    before?: string;
    after?: string;
  };
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
