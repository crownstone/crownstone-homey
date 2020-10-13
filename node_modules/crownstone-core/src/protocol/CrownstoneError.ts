

export class CrownstoneError {
  type: string;
  message: string;
  code: number;

  constructor(type, message = "", code = 500) {
    this.type = type;
    this.message = message;
    this.code = code;
  }
}