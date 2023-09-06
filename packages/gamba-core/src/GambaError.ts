import { Event } from './Event'

type Status = 'ignored' | 'rejected' | 'handling' | 'resolved'

export class GambaError2 extends Error {
  methodName: string
  methodArgs: unknown[]

  status: Status = 'ignored'

  /** Registered callbacks */
  private listeners = new Event<[]>

  constructor(
    message: string,
    methodName: string,
    methodArgs: unknown[],
  ) {
    super(message)
    this.methodName = methodName
    this.methodArgs = methodArgs
  }

  wait() {
    setTimeout(() => this.listeners.emit())
    return new Promise<Status>((resolve) => {
      const listener = () => {
        if (this.status !== 'handling') {
          resolve(this.status)
        }
      }
      this.listeners.subscribe(listener)
    })
  }

  handle() {
    this.status = 'handling'
  }

  resolve() {
    this.status = 'resolved'
    this.listeners.emit()
  }

  reject() {
    this.status = 'rejected'
    this.listeners.emit()
  }
}
