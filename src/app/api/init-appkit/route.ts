import { NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/config.server';

export async function GET() {
  const { projectId } = getServerConfig();

  return NextResponse.json({
    initialized: true,
    projectId,
  });
}
