import { NextRequest, NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_PROJECT_API;

const normalizeIdList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
};

export async function POST(request: NextRequest) {
  if (!apiBase) {
    return NextResponse.json({ code: 500, message: 'NEXT_PUBLIC_PROJECT_API 未配置。' }, { status: 500 });
  }

  const body = await request.json();
  const title = String(body?.title ?? '').trim();
  const content = String(body?.content ?? '').trim();
  const description = String(body?.description ?? '').trim();
  const cover = String(body?.cover ?? '').trim();
  const cateIds = normalizeIdList(body?.cateIds);
  const tagIds = normalizeIdList(body?.tagIds);
  const token = request.headers.get('Authorization') ?? '';

  if (!title || !content) {
    return NextResponse.json({ code: 400, message: '标题和正文不能为空。' }, { status: 400 });
  }

  const payload = {
    title,
    content,
    description: description || content.replace(/[#>*_`[\]()~-]/g, '').slice(0, 140),
    cover,
    cateIds,
    tagIds,
    createTime: String(Date.now()),
    config: {
      status: body?.status ?? 'default',
      isEncrypt: Number(body?.isEncrypt ?? 0),
      isDraft: Number(body?.isDraft ?? 0),
      isDel: 0,
      password: String(body?.password ?? ''),
    },
  };

  try {
    const response = await fetch(`${apiBase}/article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const result = await response.json().catch(() => ({
      code: response.status,
      message: response.statusText,
    }));

    return NextResponse.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Failed to publish article from homepage:', error);

    return NextResponse.json({ code: 500, message: '发布失败，请确认后端服务和文章创建接口可用。' }, { status: 500 });
  }
}
