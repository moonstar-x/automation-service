import { Level } from 'level';
import path from 'path';

export class LevelDatabaseService {
  private db: Level<string, any>;

  constructor(location: string) {
    this.db = new Level(location, {
      valueEncoding: 'json'
    });
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      return await this.db.get(key) as T;
    } catch (error: any) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }

      throw error;
    }
  }

  public async set(key: string, value: unknown): Promise<void> {
    return await this.db.put(key, value);
  }

  public async delete(key: string): Promise<void> {
    return await this.db.del(key);
  }
}

export const levelDatabaseService = new LevelDatabaseService(path.join(__dirname, '../../data/level'));
