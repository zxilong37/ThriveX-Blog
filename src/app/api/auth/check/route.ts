import { NextRequest, NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_PROJECT_API;

export async function GET(request: NextRequest) {
  if (!apiBase) {
    return NextResponse.json({ code: 500, message: 'NEXT_PUBLIC_PROJECT_API 未配置。' }, { status: 500 });
  }

  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';

  if (!token) {
    return NextResponse.json({ code: 401, message: '请先登录。' }, { status: 401 });
  }

  try {
    const response = await fetch(`${apiBase}/user/check?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const result = await response.json();

    return NextResponse.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Failed to check token:', error);

    return NextResponse.json({ code: 500, message: '登录状态校验失败。' }, { status: 500 });
  }
}
