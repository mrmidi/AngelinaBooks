'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BookOpen, Calendar, Hash, MessageCircle, Search, Star } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import exportData from './data_v2/result.json';
import { parseTelegramText, extractRating, extractTags } from '../lib/telegramParser';

type TelegramMessage = {
  id: number;
  date?: string;
  type?: string;
  text?: string | (string | { type: string; text: string; href?: string })[];
  photo?: string;
  width?: number;
  height?: number;
};

type TelegramExport = {
  messages?: TelegramMessage[];
};

type BlogPost = {
  id: number;
  date: string;
  title: string | null;
  content: React.ReactNode;
  rawText: string;
  rating: number;
  tags: string[];
  isReview: boolean;
  photo?: string;
};

const telegramExport = exportData as TelegramExport;
const reviewTagSet = new Set(['книги', 'фентези', 'детектив', 'триллер']);

const StarRating = ({ rating }: { rating: number }) => {
  if (rating === 0) return null;

  return (
    <div className="flex gap-0.5 mb-3" aria-label={`${rating} звезды`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={clsx(
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
          )}
        />
      ))}
    </div>
  );
};

const PostCard = ({ post }: { post: BlogPost }) => {
  const dateValue = new Date(post.date);
  const dateLabel = Number.isNaN(dateValue.getTime())
    ? '—'
    : format(dateValue, 'd MMM yyyy', { locale: ru });

  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-200 flex flex-col h-full">
      {post.photo && (
        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-700">
          <img
            src={`/data_v2/${post.photo}`}
            alt={post.title || 'Book cover'}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <time dateTime={post.date}>{dateLabel}</time>
          </div>
          <span className="text-slate-500">#{post.id}</span>
        </div>

        <h2
          className={clsx(
            'text-xl font-semibold mb-2 leading-snug',
            post.title ? 'text-slate-900 dark:text-white' : 'text-slate-500 italic'
          )}
        >
          {post.title || (post.isReview ? 'Без названия' : 'Заметка')}
        </h2>

        <StarRating rating={post.rating} />

        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none mb-4 whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">
          {post.content}
        </div>

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full"
            >
              <Hash size={12} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

type FilterType = 'reviews' | 'notes' | 'all';

export default function BookBlog() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const posts: BlogPost[] = useMemo(() => {
    const messages = telegramExport.messages ?? [];

    return messages
      .filter((message) => message.type !== 'service' && message.text)
      .map((message) => {
        const parsed = parseTelegramText(message.text ?? '');
        const rating = extractRating(parsed.raw);
        const tags = extractTags(parsed.raw);
        const isReview =
          rating > 0 ||
          Boolean(parsed.titleCandidate) ||
          tags.some((tag) => reviewTagSet.has(tag));

        return {
          id: message.id,
          date: message.date ?? '',
          title: parsed.titleCandidate,
          content: parsed.jsx,
          rawText: parsed.raw.toLowerCase(),
          rating,
          tags,
          isReview,
          photo: message.photo,
        };
      });
  }, []);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filter === 'reviews' && !post.isReview) return false;
      if (filter === 'notes' && post.isReview) return false;

      if (search) {
        return post.rawText.includes(search.toLowerCase());
      }

      return true;
    });
  }, [posts, filter, search]);

  const tabClasses = (isActive: boolean) =>
    twMerge(
      'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
      isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
        : 'text-slate-500 hover:text-slate-700'
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-white/90 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 text-white p-2 rounded-2xl">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">@librorumlegere</p>
              <p className="text-lg">Книги</p>
            </div>
          </div>
          <div className="text-sm text-slate-500">{posts.length} записей</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-1 shadow-sm">
            <button onClick={() => setFilter('reviews')} className={tabClasses(filter === 'reviews')}>
              Рецензии
            </button>
            <button onClick={() => setFilter('notes')} className={tabClasses(filter === 'notes')}>
              Заметки
            </button>
            <button onClick={() => setFilter('all')} className={tabClasses(filter === 'all')}>
              Всё
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск по автору или названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Ничего не найдено</p>
          </div>
        )}
      </main>
    </div>
  );
}
