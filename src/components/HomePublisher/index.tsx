'use client';

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast, ToastContainer } from 'react-toastify';
import {
  FiBarChart2,
  FiChevronDown,
  FiClock,
  FiEye,
  FiFileText,
  FiHash,
  FiHeart,
  FiImage,
  FiLogIn,
  FiLogOut,
  FiMessageSquare,
  FiSave,
  FiSend,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

import { Cate } from '@/types/app/cate';
import { Tag } from '@/types/app/tag';

type PublishStatus = 'default' | 'no_home' | 'hide';

type StoredUser = {
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  info?: string;
};

const tokenKey = 'thrivex_blog_token';
const userKey = 'thrivex_blog_user';
const authChangedEvent = 'thrivex-auth-changed';

const starterMarkdown = `## 开篇

把今天的 GIS 开发经验写下来：背景、踩坑、解决方案、可以复用的代码。

\`\`\`ts
const idea = '从地图问题里提炼工程方法';
\`\`\`
`;

const flattenCates = (list: Cate[] = [], depth = 0): Array<Cate & { depth: number }> => {
  return list.flatMap((item) => [{ ...item, depth }, ...flattenCates(item.children ?? [], depth + 1)]);
};

const stripMarkdown = (value: string) => value.replace(/[#>*_`[\]()~-]/g, '').replace(/\s+/g, ' ').trim();

export default function HomePublisher() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const [content, setContent] = useState(starterMarkdown);
  const [status, setStatus] = useState<PublishStatus>('default');
  const [isDraft, setIsDraft] = useState(false);
  const [cateIds, setCateIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [cates, setCates] = useState<Cate[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState<StoredUser>({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkingToken, setCheckingToken] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const flatCates = useMemo(() => flattenCates(cates).filter((cate) => cate.type === 'cate'), [cates]);
  const autoDescription = useMemo(() => stripMarkdown(content).slice(0, 140), [content]);
  const wordCount = useMemo(() => stripMarkdown(content).length, [content]);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 450));
  const selectedCateNames = flatCates.filter((cate) => cateIds.includes(String(cate.id))).map((cate) => cate.name);
  const selectedTagNames = tags.filter((tag) => tagIds.includes(String(tag.id))).map((tag) => tag.name);
  const hasLoggedIn = !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem(tokenKey) ?? '';
    const storedUser = localStorage.getItem(userKey);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(userKey);
      }
    }

    setCheckingToken(false);
  }, []);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await fetch('/api/home-publisher/meta');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message);
        }

        setCates(result?.data?.cates ?? []);
        setTags(result?.data?.tags ?? []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '分类和标签加载失败');
      } finally {
        setLoadingMeta(false);
      }
    };

    loadMeta();
  }, []);

  const toggleValue = (value: string, values: string[], setter: Dispatch<SetStateAction<string[]>>) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const login = async () => {
    if (!username.trim() || !password) {
      toast.warn('请输入账号和密码。');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();

      if (!response.ok || result?.code >= 400) {
        throw new Error(result?.message ?? '登录失败');
      }

      const nextToken = result?.data?.token ?? '';
      const nextUser = result?.data?.user ?? {};

      localStorage.setItem(tokenKey, nextToken);
      localStorage.setItem(userKey, JSON.stringify(nextUser));
      setToken(nextToken);
      setUser(nextUser);
      setPassword('');
      window.dispatchEvent(new Event(authChangedEvent));
      toast.success('登录成功，可以发布文章了。');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登录失败');
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken('');
    setUser({});
    setProfileOpen(false);
    window.dispatchEvent(new Event(authChangedEvent));
    toast.success('已退出登录。');
  };

  const publishArticle = async (draftOverride = isDraft) => {
    if (!token) {
      toast.warn('请先登录，再发布文章。');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.warn('标题和正文都要写一点。');
      return;
    }

    if (!cateIds.length) {
      toast.warn('至少选择一个分类，保证文章关系表完整。');
      return;
    }

    setPublishing(true);

    try {
      const response = await fetch('/api/home-publisher/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || autoDescription,
          cover,
          content,
          cateIds,
          tagIds,
          status,
          isDraft: draftOverride ? 1 : 0,
        }),
      });
      const result = await response.json();

      if (!response.ok || result?.code >= 400) {
        throw new Error(result?.message ?? '发布失败');
      }

      toast.success(draftOverride ? '草稿已保存。' : '文章已发布，数据库关系已同步。');
      setTitle('');
      setDescription('');
      setCover('');
      setContent(starterMarkdown);
      setCateIds([]);
      setTagIds([]);
      setStatus('default');
      setIsDraft(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '发布失败，请稍后重试');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1500px] overflow-hidden rounded-[8px] border border-[#d9d2c4] bg-[#fbf7ef] shadow-[0_30px_90px_rgba(36,31,23,0.12)] dark:border-slate-800 dark:bg-[#101419]">
      <ToastContainer autoClose={1800} hideProgressBar />

      <div className="flex flex-col gap-4 border-b border-[#e1d8c8] bg-[#fffdf7] px-4 py-4 dark:border-slate-800 dark:bg-[#151a21] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#1f3b30] text-white shadow-[0_10px_22px_rgba(31,59,48,0.24)]">
            <FiFileText />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a6d3b] dark:text-amber-300">Editorial Desk</p>
            <h1 className="truncate text-xl font-black text-[#1e2420] dark:text-white sm:text-2xl">文章发布工作台</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="rounded-[6px] border border-[#d8ccb8] px-3 py-2 text-sm font-bold text-[#3a3327] transition hover:bg-[#f2eadb] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            返回首页
          </Link>

          {hasLoggedIn ? (
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((value) => !value)} className="inline-flex items-center gap-3 rounded-[8px] bg-[#1f3b30] px-3 py-2 text-sm font-black text-white shadow-[0_10px_24px_rgba(31,59,48,0.2)]">
                {user.avatar ? <img src={user.avatar} alt={user.name ?? '用户头像'} className="size-7 rounded-full object-cover" /> : <span className="grid size-7 place-items-center rounded-full bg-white/15"><FiUser /></span>}
                <span className="max-w-[120px] truncate">{user.name || user.username || '管理员'}</span>
                <FiChevronDown className={`transition ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-30 w-[280px] overflow-hidden rounded-[8px] border border-[#ded4c2] bg-white shadow-[0_20px_54px_rgba(20,24,30,0.18)] dark:border-slate-800 dark:bg-[#171d25]">
                  <div className="flex items-center gap-3 border-b border-[#eee5d5] p-4 dark:border-slate-800">
                    {user.avatar ? <img src={user.avatar} alt={user.name ?? '用户头像'} className="size-12 rounded-full object-cover" /> : <div className="grid size-12 place-items-center rounded-full bg-[#edf5e8] text-[#1f3b30]"><FiUser /></div>}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#1e2420] dark:text-white">{user.name || '管理员'}</p>
                      <p className="truncate text-xs text-[#80735f] dark:text-slate-400">{user.email || user.username || '已登录'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 p-3 text-xs text-[#6d604f] dark:text-slate-400">
                    <p className="rounded-[6px] bg-[#f8f3ea] p-3 dark:bg-slate-900">{user.info || '当前账号拥有文章发布权限。'}</p>
                    <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#2d2924] px-3 py-2.5 text-sm font-black text-white transition hover:bg-[#1f3b30]">
                      <FiLogOut /> 退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-[8px] border border-[#ded4c2] bg-white p-2 dark:border-slate-800 dark:bg-[#101419]">
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="账号" className="h-9 w-[120px] rounded-[6px] border border-[#e2d8c8] bg-[#fffdf8] px-3 text-sm outline-none focus:border-[#1f3b30] dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" type="password" className="h-9 w-[120px] rounded-[6px] border border-[#e2d8c8] bg-[#fffdf8] px-3 text-sm outline-none focus:border-[#1f3b30] dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <button type="button" onClick={login} disabled={checkingToken} className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#1f3b30] px-3 text-sm font-black text-white transition hover:bg-[#315b49] disabled:opacity-60">
                <FiLogIn /> 登录
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-190px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="flex min-w-0 flex-col border-b border-[#e1d8c8] dark:border-slate-800 xl:border-b-0 xl:border-r">
          <div className="grid gap-3 border-b border-[#e1d8c8] bg-[#f6efe3] p-4 dark:border-slate-800 dark:bg-[#121820] md:grid-cols-[minmax(0,1fr)_180px]">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="文章标题，例如：Leaflet 与高德底图坐标偏移排查" className="min-w-0 rounded-[8px] border border-[#d9cebd] bg-white px-4 py-3 text-xl font-black text-[#1d2421] outline-none transition focus:border-[#1f3b30] dark:border-slate-700 dark:bg-[#0d1117] dark:text-white" />
            <select value={status} onChange={(event) => setStatus(event.target.value as PublishStatus)} className="rounded-[8px] border border-[#d9cebd] bg-white px-3 py-3 text-sm font-bold text-[#3f382d] outline-none dark:border-slate-700 dark:bg-[#0d1117] dark:text-white">
              <option value="default">首页展示</option>
              <option value="no_home">不在首页</option>
              <option value="hide">全站隐藏</option>
            </select>
          </div>

          <textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-[520px] flex-1 resize-none border-0 bg-[#fffdf8] px-5 py-5 font-mono text-[15px] leading-8 text-[#222820] outline-none dark:bg-[#0d1117] dark:text-slate-100" />

          <div className="grid gap-3 border-t border-[#e1d8c8] bg-[#f6efe3] p-4 dark:border-slate-800 dark:bg-[#121820] md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 ring-1 ring-[#e1d8c8] dark:bg-[#0d1117] dark:ring-slate-800">
              <FiHash className="text-[#8a6d3b]" />
              <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder={`摘要，留空自动截取：${autoDescription || '正文前 140 字'}`} className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white" />
            </label>
            <label className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 ring-1 ring-[#e1d8c8] dark:bg-[#0d1117] dark:ring-slate-800">
              <FiImage className="text-[#8a6d3b]" />
              <input value={cover} onChange={(event) => setCover(event.target.value)} placeholder="封面图 URL，可留空" className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white" />
            </label>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col bg-[#fffaf1] dark:bg-[#141920]">
          <div className="border-b border-[#e1d8c8] p-4 dark:border-slate-800">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[8px] bg-white p-3 ring-1 ring-[#e5dac9] dark:bg-[#0d1117] dark:ring-slate-800">
                <p className="flex items-center gap-1 text-xs font-bold text-[#8a6d3b] dark:text-amber-300"><FiClock /> 字数</p>
                <p className="mt-1 text-lg font-black text-[#1e2420] dark:text-white">{wordCount}</p>
                <p className="mt-0.5 text-[11px] text-[#8a7c65] dark:text-slate-500">约 {readingMinutes} 分钟</p>
              </div>
              <div className="rounded-[8px] bg-white p-3 ring-1 ring-[#e5dac9] dark:bg-[#0d1117] dark:ring-slate-800">
                <p className="flex items-center gap-1 text-xs font-bold text-[#8a6d3b] dark:text-amber-300"><FiEye /> 浏览</p>
                <p className="mt-1 text-lg font-black text-[#1e2420] dark:text-white">0</p>
              </div>
              <div className="rounded-[8px] bg-white p-3 ring-1 ring-[#e5dac9] dark:bg-[#0d1117] dark:ring-slate-800">
                <p className="flex items-center gap-1 text-xs font-bold text-[#8a6d3b] dark:text-amber-300"><FiMessageSquare /> 评论</p>
                <p className="mt-1 text-lg font-black text-[#1e2420] dark:text-white">0</p>
              </div>
            </div>

            <div className="mt-3 rounded-[8px] bg-[#2d2924] p-3 text-xs leading-6 text-[#f3ead8]">
              <p className="flex items-center gap-2 font-black"><FiBarChart2 /> 互动数据</p>
              <p className="mt-1 opacity-80">浏览量和评论数会由后端文章表自动统计。当前后端没有点赞字段，点赞入口先展示为待接入状态，不写入数据库。</p>
            </div>
          </div>

          <div className="space-y-4 border-b border-[#e1d8c8] p-4 dark:border-slate-800">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#8a6d3b] dark:text-amber-300">
                <FiFileText /> 分类
              </p>
              <div className="flex max-h-[104px] flex-wrap gap-2 overflow-auto">
                {loadingMeta && <span className="text-xs text-slate-400">正在加载...</span>}
                {!loadingMeta && !flatCates.length && <span className="text-xs text-slate-400">暂无分类</span>}
                {flatCates.map((cate) => {
                  const id = String(cate.id);

                  return (
                    <button key={id} type="button" onClick={() => toggleValue(id, cateIds, setCateIds)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${cateIds.includes(id) ? 'bg-[#1f3b30] text-white' : 'bg-white text-[#4e4639] ring-1 ring-[#e1d8c6] hover:bg-[#f4ecdc] dark:bg-[#0d1117] dark:text-slate-300 dark:ring-slate-800'}`}>
                      {cate.depth ? `${'· '.repeat(cate.depth)}${cate.name}` : cate.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#8a6d3b] dark:text-amber-300">
                <FiHash /> 标签
              </p>
              <div className="flex max-h-[104px] flex-wrap gap-2 overflow-auto">
                {loadingMeta && <span className="text-xs text-slate-400">正在加载...</span>}
                {!loadingMeta && !tags.length && <span className="text-xs text-slate-400">暂无标签</span>}
                {tags.map((tag) => {
                  const id = String(tag.id);

                  return (
                    <button key={id} type="button" onClick={() => toggleValue(id, tagIds, setTagIds)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${tagIds.includes(id) ? 'bg-[#a94d2f] text-white' : 'bg-white text-[#4e4639] ring-1 ring-[#e1d8c6] hover:bg-[#f4ecdc] dark:bg-[#0d1117] dark:text-slate-300 dark:ring-slate-800'}`}>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-black text-[#1e2420] dark:text-white">
                <FiEye /> 实时预览
              </p>
              <div className="flex items-center gap-2 text-xs text-[#8a6d3b] dark:text-slate-400">
                <FiHeart /> 待接入点赞
              </div>
            </div>

            <article className="prose prose-sm max-w-none rounded-[8px] bg-white p-5 text-[#302a20] ring-1 ring-[#e5dac9] dark:prose-invert dark:bg-[#0d1117] dark:ring-slate-800">
              {!!cover && <img src={cover} alt="文章封面预览" className="mb-4 max-h-48 w-full rounded-[8px] object-cover" />}
              <h1>{title || '未命名文章'}</h1>
              <p className="text-sm text-[#857966]">{description || autoDescription || '摘要会显示在这里。'}</p>
              {!!selectedCateNames.length && <p>{selectedCateNames.join(' / ')}</p>}
              {!!selectedTagNames.length && <p>{selectedTagNames.map((name) => `#${name}`).join(' ')}</p>}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-[#e1d8c8] bg-[#f6efe3] p-4 dark:border-slate-800 dark:bg-[#121820]">
            <label className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-3 text-sm font-bold text-[#302a20] ring-1 ring-[#e1d8c8] dark:bg-[#0d1117] dark:text-slate-100 dark:ring-slate-800">
              <input type="checkbox" checked={isDraft} onChange={(event) => setIsDraft(event.target.checked)} className="size-4 accent-[#1f3b30]" />
              草稿
            </label>
            <button type="button" onClick={() => publishArticle(true)} disabled={publishing} className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d4c9b9] px-3 py-3 text-sm font-black text-[#302a20] transition hover:bg-[#efe4d4] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <FiSave /> 保存
            </button>
            <button type="button" onClick={() => publishArticle(false)} disabled={publishing} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#1f3b30] px-5 py-3 text-sm font-black text-white transition hover:bg-[#315b49] disabled:cursor-not-allowed disabled:opacity-60">
              {publishing ? <FiSettings className="animate-spin" /> : <FiSend />} {publishing ? '提交中' : '发布'}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
