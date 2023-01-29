import { EventEmitter } from 'events';

export abstract class Trigger extends EventEmitter {
  public abstract init(): Promise<void>
}
