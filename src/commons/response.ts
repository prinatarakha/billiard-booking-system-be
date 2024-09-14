export class APIResponse {
  data: any;
  status: number;

  constructor(status: number, data: any) {
    this.data = data;
    this.status = status;
  }

  generate() {
    return {
      data: this.data,
      status: this.status
    }
  }
}

export class ErrorResponse extends APIResponse {
  constructor(status: number, message: Error | string) {
    super(status, message.toString());
  }
}