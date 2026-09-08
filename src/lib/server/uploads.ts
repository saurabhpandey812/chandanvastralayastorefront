import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { imageFileError } from '@/lib/validation';

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function saveReviewImages(files: File[]) {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'reviews');
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const err = imageFileError(file);
    if (err) throw new Error(err);
    const ext = EXT[file.type] || 'jpg';
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/uploads/reviews/${name}`);
  }
  return urls;
}
