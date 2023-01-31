import fs from 'fs';
import path from 'path';

export const isDirectory = (path: string) => {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
};

export const getAllFilesRecursive = (directory: string): string[] => {
  if (!isDirectory(directory)) {
    throw new Error(`${directory} is not a directory.`);
  }

  const traverseDirectory = (directory: string, files: string[]): string[] => {
    const filesInDir = fs.readdirSync(directory);

    filesInDir.forEach((file) => {
      const currentFile = path.join(directory, file);

      if (fs.lstatSync(currentFile).isDirectory()) {
        files.concat(traverseDirectory(currentFile, files));
      } else {
        files.push(currentFile);
      }
    });

    return files;
  };

  return traverseDirectory(directory, []);
};
