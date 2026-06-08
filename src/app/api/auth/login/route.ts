import { NextRequest, NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_PROJECT_API;

export async function POST(request: NextRequest) {
  if (!apiBase) {
    return NextResponse.json({ code: 500, message: 'NEXT_PUBLIC_PROJECT_API 未配置。' }, { status: 500 });
  }

  const body = await request.json();

  try {
    const response = await fetch(`${apiBase}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: String(body?.username ?? '').trim(),
        password: String(body?.password ?? ''),
      }),
      cache: 'no-store',
    });
    const result = await response.json();

    return NextResponse.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Failed to login:', error);

    return NextResponse.json({ code: 500, message: '登录失败，请确认后端服务可用。' }, { status: 500 });
  }
}
