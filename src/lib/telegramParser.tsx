import type { ReactNode } from 'react';

export type TextEntity = {
  type: string;
  text: string;
  href?: string;
};

export type ParseResult = {
  jsx: ReactNode;
  raw: string;
  titleCandidate: string | null;
};

export const parseTelegramText = (
  textEntry: string | (string | TextEntity)[]
): ParseResult => {
  if (typeof textEntry === 'string') {
    return { jsx: textEntry, raw: textEntry, titleCandidate: null };
  }

  let raw = '';
  let titleCandidate: string | null = null;

  const jsx = textEntry.map((item, index) => {
    if (typeof item === 'string') {
      raw += item;
      return <span key={index}>{item}</span>;
    }

    raw += item.text;
    switch (item.type) {
      case 'bold':
        if (!titleCandidate) {
          titleCandidate = item.text;
        }
        return (
          <strong
            key={index}
            className="font-bold text-slate-900 dark:text-slate-100"
          >
            {item.text}
          </strong>
        );
      case 'italic':
        return (
          <em
            key={index}
            className="italic text-slate-700 dark:text-slate-300 border-l-2 border-slate-300 pl-2 my-2 block"
          >
            {item.text}
          </em>
        );
      case 'hashtag':
        return (
          <span
            key={index}
            className="text-blue-600 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-1 rounded mx-0.5 text-sm"
          >
            {item.text}
          </span>
        );
      case 'text_link':
        return (
          <a key={index} href={item.href} className="text-blue-600 hover:underline">
            {item.text}
          </a>
        );
      case 'strikethrough':
        return (
          <s key={index} className="decoration-slate-400 text-slate-500">
            {item.text}
          </s>
        );
      default:
        return <span key={index}>{item.text}</span>;
    }
  });

  return { jsx, raw, titleCandidate };
};

export const extractRating = (text: string): number => {
  const matches = text.match(/⭐️|⭐/g);
  return matches ? matches.length : 0;
};

export const extractTags = (text: string): string[] => {
  const matches = text.match(/#[\p{L}\p{N}]+/gu);
  if (!matches) return [];
  return Array.from(new Set(matches.map((tag) => tag.slice(1).toLowerCase())));
};