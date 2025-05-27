export class HttpResp<T> {
  success: boolean;
  message: string;
  data?: T;

  constructor(options: { success: boolean; message: string; data?: any }) {
    this.success = options.success;
    this.message = options.message;
    this.data = options.data;
  }

  static success<T>(data?: T) {
    return new HttpResp({ success: true, message: 'success', data });
  }

  static error<T>(message: string = 'error', data?: T) {
    return new HttpResp({ success: false, message, data });
  }
}
