export type ExpiringCacheValue<T> = {
  data: T,
  expires_in: number
};

export class ExpiringCache<K, V> {
  private readonly map: Map<K, ExpiringCacheValue<V>>;
  private readonly ttl: number;

  constructor(ttl: number) {
    this.map = new Map();
    this.ttl = ttl;
  }

  public set(key: K, value: V): void {
    this.map.set(key, {
      data: value,
      expires_in: Date.now() + this.ttl
    });
  }

  public has(key: K): boolean {
    this.ensureTtl(key);
    return this.map.has(key);
  }

  public get(key: K): V | undefined {
    this.ensureTtl(key);
    return this.map.get(key)?.data;
  }

  private ensureTtl(key: K): void {
    const stored = this.map.get(key);
    if (stored && stored.expires_in < Date.now()) {
      this.map.delete(key);
    }
  }
}
