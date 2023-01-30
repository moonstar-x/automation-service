/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
import { EventEmitter } from 'events';

interface TriggerEvents {
  trigger: [unknown] // TODO: Gotta see how we can type this.
}

export declare interface Trigger {
  on<K extends keyof TriggerEvents>(event: K, listener: (...args: TriggerEvents[K]) => void): this
  once<K extends keyof TriggerEvents>(event: K, listener: (...args: TriggerEvents[K]) => void): this
  emit<K extends keyof TriggerEvents>(event: K, ...args: TriggerEvents[K]): boolean
  off<K extends keyof TriggerEvents>(event: K, listener: (...args: TriggerEvents[K]) => void): this
  removeAllListeners<K extends keyof TriggerEvents>(event?: K): this
}

export abstract class Trigger extends EventEmitter {
  public abstract init(): void
}
