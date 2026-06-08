import { NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_PROJECT_API;

const getJson = async (path: string, init?: RequestInit) => {
  if (!apiBase) {
    throw new Error('NEXT_PUBLIC_PROJECT_API is not configured');
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  return response.json();
};

export async function GET() {
  try {
    const [cateResponse, tagResponse] = await Promise.all([getJson('/cate?pattern=tree'), getJson('/tag/list', { method: 'POST' })]);

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        cates: cateResponse?.data?.result ?? cateResponse?.data ?? [],
        tags: tagResponse?.data ?? [],
      },
    });
  } catch (error) {
    console.error('Failed to load publisher metadata:', error);

    return NextResponse.json(
      {
        code: 500,
        message: '无法加载分类和标签，请确认后端服务已启动。',
        data: {
          cates: [],
          tags: [],
        },
      },
      { status: 500 }
    );
  }
}
