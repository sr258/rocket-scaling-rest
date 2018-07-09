var PromisePool = require('es6-promise-pool')

class ConcurrentRequester {
  constructor(client, startNr, stopNr, concurrencyLevel, promiseFunction, afterEachPromiseFunction) {
    this.client = client;
    this.currentNr = startNr - 1;
    this.stopNr = stopNr;
    this.promiseFunction = promiseFunction;
    this.afterEachPromiseFunction = afterEachPromiseFunction;
    this.concurrencyLevel = concurrencyLevel;
  }

  async start() {
    var pool = new PromisePool(() => {
      if (this.currentNr < this.stopNr) {
        this.currentNr++;
        return this.promiseFunction(this.client, this.currentNr);
      }
      else {
        return null;
      }
    }, this.concurrencyLevel);
    pool.addEventListener('fulfilled', (event) => {
      this.afterEachPromiseFunction(event);
    });
    return pool.start();
  }
}

module.exports = ConcurrentRequester;