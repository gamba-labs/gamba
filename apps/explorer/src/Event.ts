export type Listener<T extends unknown[]> = (...args: T) => void;

export class Event<T extends unknown[] = []> {
  private listeners: Array<Listener<T>> = []

  emit(...payload: T) {
    for (const listener of this.listeners) {
      listener(...payload)
    }
  }

  unsubscribe(listener: Listener<T>) {
    const index = this.listeners.indexOf(listener)
    if (index < 0) {
      console.warn('Event listener not found')
      return
    }
    this.listeners.splice(index, 1)
  }

  /**
   *
   * @param listener
   * @returns
   */
  subscribe(listener: Listener<T>) {
    this.listeners.push(listener)
    return () => this.unsubscribe(listener)
  }
}
