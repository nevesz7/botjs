export class CustomError extends Error {
  code: number;
  additionalInfo?: string;
  constructor(message: string, code: number, additionalInfo?: string) {
    super(message);
    this.message = message;
    this.code = code;
    this.additionalInfo = additionalInfo;
  }
}
