class Cancel {
  constructor(message) {
    this.message = message;
    this.__CANCEL__ = true;
  }

  static isCancel(value) {
    return !!(value && value.__CANCEL__);
  }

  toString() {
    return this.message ? `Cancel: ${this.message}` : 'Cancel';
  }
}

export default Cancel;