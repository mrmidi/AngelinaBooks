import { describe, expect, it } from 'vitest';
import { parseTelegramText, extractRating, extractTags } from './telegramParser';

describe('telegram parser helpers', () => {
  it('extracts bold titles and preserves concatenated strings', () => {
    const { titleCandidate, raw, jsx } = parseTelegramText([
      { type: 'bold', text: 'Title' },
      '\nОписание',
      { type: 'hashtag', text: '#фентези' },
    ]);

    expect(titleCandidate).toBe('Title');
    expect(raw).toContain('Описание');
    expect(jsx).toBeDefined();
  });

  it('appends italic and strikethrough text to the raw output', () => {
    const { raw } = parseTelegramText([
      { type: 'italic', text: 'quote' },
      { type: 'strikethrough', text: 'old' },
    ]);
    expect(raw).toContain('quote');
    expect(raw).toContain('old');
  });

  it('returns text nodes untouched when input is a simple string', () => {
    const result = parseTelegramText('Just text');
    expect(result.raw).toBe('Just text');
    expect(result.titleCandidate).toBeNull();
  });

  it('counts star ratings correctly', () => {
    expect(extractRating('⭐️⭐️⭐️')).toBe(3);
    expect(extractRating('No stars')).toBe(0);
  });

  it('normalizes hashtag list to unique values', () => {
    expect(extractTags('#Фентези #фентези #mystery')).toEqual([
      'фентези',
      'mystery',
    ]);
  });
});