import { GambaMethods } from './methods'

export class GambaError2 extends Error {
  methodName: keyof GambaMethods
  methodArgs: any[]

  status = 'ignored'

  /** Registered callbacks */
  private listeners = new Array<() => void>()

  constructor(
    message: string,
    methodName: keyof GambaMethods,
    methodArgs: any[],
  ) {
    super(message)
    this.methodName = methodName
    this.methodArgs = methodArgs
  }

  waitForRetry() {
    //
    setTimeout(() => {
      for (const listener of this.listeners) {
        listener()
      }
    })
    return new Promise((resolve, reject) => {
      const listener = () => {
        if (this.status === 'ignored' || this.status === 'rejected') {
          reject()
        }
        if (this.status === 'resolved') {
          resolve(true)
        }
      }
      this.listeners.push(listener)
    })
  }

  handle() {
    //
    this.status = 'handling'
  }

  resolve() {
    this.status = 'resolved'
    for (const listener of this.listeners) {
      listener()
    }
  }

  reject() {
    this.status = 'rejected'
    for (const listener of this.listeners) {
      listener()
    }
  }
}
