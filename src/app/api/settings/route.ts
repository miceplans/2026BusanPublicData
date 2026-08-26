import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      ok: true,
      settings,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: '운영 설정을 불러올 수 없습니다.' },
      { status: 503 },
    );
  }
}
