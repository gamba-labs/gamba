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

  private invokeListeners() {
    for (const listener of this.listeners) {
      listener()
    }
  }

  waitForRetry() {
    setTimeout(() => this.invokeListeners())
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
    this.status = 'handling'
  }

  resolve() {
    this.status = 'resolved'
    this.invokeListeners()
  }

  reject() {
    this.status = 'rejected'
    this.invokeListeners()
  }
}
