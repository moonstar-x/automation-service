import { EventEmitter } from 'events';

// The T generic represents the payload that comes on trigger. This generic bubbles up to WebhookTrigger and WebhookManager.
// It should be specified at the Workflow class definition.
interface TriggerEvents<T> {
  trigger: [T?]
}

export declare interface Trigger<T> {
  on<K extends keyof TriggerEvents<T>>(event: K, listener: (...args: TriggerEvents<T>[K]) => void): this
  once<K extends keyof TriggerEvents<T>>(event: K, listener: (...args: TriggerEvents<T>[K]) => void): this
  emit<K extends keyof TriggerEvents<T>>(event: K, ...args: TriggerEvents<T>[K]): boolean
  off<K extends keyof TriggerEvents<T>>(event: K, listener: (...args: TriggerEvents<T>[K]) => void): this
  removeAllListeners<K extends keyof TriggerEvents<T>>(event?: K): this
}

export abstract class Trigger<T> extends EventEmitter {
  public abstract init(): void
}
