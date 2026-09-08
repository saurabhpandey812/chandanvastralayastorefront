import { NextResponse } from 'next/server';
import { saveReviewImages } from '@/lib/server/uploads';
import { requireUser } from '@/lib/server/requireUser';
import { imageFileError, MAX_REVIEW_IMAGES } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { error } = await requireUser();
  if (error) return error;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: 'Could not read files' }, { status: 400 });
  }

  const files = form
    .getAll('files')
    .filter((item): item is File => typeof item === 'object' && item !== null && 'arrayBuffer' in item && 'type' in item);
  if (files.length === 0) {
    return NextResponse.json({ error: 'Choose at least one image' }, { status: 400 });
  }
  if (files.length > MAX_REVIEW_IMAGES) {
    return NextResponse.json({ error: `You can upload up to ${MAX_REVIEW_IMAGES} photos` }, { status: 400 });
  }

  for (const file of files) {
    const err = imageFileError(file);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  try {
    const urls = await saveReviewImages(files);
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: 'Could not save images' }, { status: 500 });
  }
}
