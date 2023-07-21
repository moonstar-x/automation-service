import { Level } from 'level';
import ModuleError from 'module-error';
import path from 'path';

export class LevelDatabaseService {
  private readonly db: Level<string, unknown>;

  constructor(location: string) {
    this.db = new Level(location, {
      valueEncoding: 'json'
    });
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      return await this.db.get(key) as T;
    } catch (error) {
      if ((error as ModuleError).code === 'LEVEL_NOT_FOUND') {
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
