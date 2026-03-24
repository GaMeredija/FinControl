import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function ensureJsonFile(filePath: string) {
  const directoryPath = path.dirname(filePath);
  await mkdir(directoryPath, { recursive: true });

  try {
    await readFile(filePath, 'utf-8');
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code === 'ENOENT') {
      await writeFile(filePath, '[]\n', 'utf-8');
      return;
    }

    throw error;
  }
}

export async function readJsonFile<T>(filePath: string) {
  await ensureJsonFile(filePath);
  const raw = await readFile(filePath, 'utf-8');

  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown) {
  await ensureJsonFile(filePath);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

