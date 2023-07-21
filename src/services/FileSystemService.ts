import fs from 'fs';
import path from 'path';
import { isDirectory, createDirectoryIfNoExists } from '@utils/filesystem';

export interface FileLocation {
  name: string
  absolutePath: string
}

export interface DirectoryContent {
  files: FileLocation[]
  directories: FileLocation[]
}

export class DirectoryManager {
  private readonly service: FileSystemService;
  private readonly location: string;

  constructor(service: FileSystemService, location: string) {
    if (!isDirectory(location)) {
      throw new Error(`${location} must be a valid directory.`);
    }

    this.service = service;
    this.location = location;
  }

  public async getFiles(): Promise<DirectoryContent> {
    const files = await fs.promises.readdir(this.location, { withFileTypes: true });

    return files.reduce((content, file) => {
      const fileLocation: FileLocation = {
        name: file.name,
        absolutePath: path.join(this.location, file.name)
      };

      if (file.isDirectory()) {
        content.directories.push(fileLocation);
      } else {
        content.files.push(fileLocation);
      }

      return content;
    }, {
      files: [],
      directories: []
    } as DirectoryContent);
  }

  public async getFile(file: string): Promise<FileLocation | null> {
    const absolutePath = path.join(this.location, file);
    try {
      await fs.promises.access(absolutePath, fs.constants.F_OK);
      return {
        name: file,
        absolutePath
      };
    } catch (error) {
      return null;
    }
  }

  public goToParent(): DirectoryManager {
    return this.service.createDirectoryManager(path.dirname(this.location));
  }

  public goTo(location: string): DirectoryManager {
    return this.service.createDirectoryManager(path.join(this.location, location));
  }
}

export class FileSystemService {
  private readonly directory: DirectoryManager;
  private readonly location: string;

  constructor(absoluteLocation: string) {
    createDirectoryIfNoExists(absoluteLocation);
    this.directory = new DirectoryManager(this, absoluteLocation);
    this.location = absoluteLocation;
  }

  public createDirectoryManager(location: string): DirectoryManager {
    if (!location.startsWith(this.location)) {
      throw new Error(`Tried to access ${location} outside of ${this.location}`);
    }

    return new DirectoryManager(this, location);
  }

  public getDirectory() {
    return this.directory;
  }
}

export const fileSystemService = new FileSystemService(path.join(__dirname, '../../data/fs'));
