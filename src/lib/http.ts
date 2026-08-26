import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}
export function validationError(error: ZodError) {
  return jsonError('입력값을 확인해 주세요.', 422, error.flatten().fieldErrors);
}
export function safeErrorSummary(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : 'unknown_error';
}
