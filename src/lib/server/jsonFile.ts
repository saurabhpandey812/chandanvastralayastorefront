import { promises as fs } from 'fs';
import path from 'path';

const queues = new Map<string, Promise<unknown>>();

function enqueue<T>(file: string, task: () => Promise<T>) {
  const prev = queues.get(file) ?? Promise.resolve();
  const next = prev.then(task, task);
  queues.set(
    file,
    next.then(
      () => undefined,
      () => undefined
    )
  );
  return next;
}

export function jsonFile<T>(relative: string, seed: T) {
  const filePath = path.join(process.cwd(), 'data', relative);

  async function readFile(): Promise<T> {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw) as T;
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
  }

  async function writeFile(data: T) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  return {
    read: () => enqueue(filePath, readFile),
    write: (data: T) => enqueue(filePath, () => writeFile(data)),
    update: (fn: (current: T) => T | Promise<T>) =>
      enqueue(filePath, async () => {
        const current = await readFile();
        const next = await fn(current);
        await writeFile(next);
        return next;
      }),
  };
}
