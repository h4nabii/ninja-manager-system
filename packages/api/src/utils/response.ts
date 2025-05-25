export class HttpResp<T> {
  message: string;
  data?: T;

  constructor(options: { message: string; data?: any }) {
    this.message = options.message;
    this.data = options.data;
  }

  static success<T>(data?: T) {
    return new HttpResp({ message: 'success', data });
  }

  static error<T>(message: string = 'error', data?: T) {
    return new HttpResp({ message, data });
  }
}
