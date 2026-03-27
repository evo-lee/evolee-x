import { NextResponse } from 'next/server';
import packageJson from '@/package.json';

export function GET() {
  return NextResponse.json({
    ok: true,
    status: 'healthy',
    version: packageJson.version,
    env: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
  });
}
