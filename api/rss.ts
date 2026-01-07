import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.shipdago.com';
const SITE_TITLE = 'SHIPDAGO 인사이트';
const SITE_DESCRIPTION = '포워딩/무역 업계의 최신 트렌드와 인사이트';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSummary(content: string): string {
  const text = stripHtml(content);
  if (text.length <= 200) return text;
  return text.substring(0, 200) + '...';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: insights, error } = await supabase
      .from('insights')
      .select('id, title, content, date, tag, author, image_url')
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(20);

    if (error) throw error;

    const now = new Date().toUTCString();

    const rssItems = (insights || []).map(insight => {
      const pubDate = new Date(insight.date).toUTCString();
      const link = `${SITE_URL}/insights/${insight.id}`;
      const description = getSummary(insight.content || '');

      return `
    <item>
      <title>${escapeXml(insight.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(insight.tag)}</category>
      <description>${escapeXml(description)}</description>
      ${insight.author ? `<author>${escapeXml(insight.author)}</author>` : ''}
    </item>`;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>${rssItems}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(rssFeed);

  } catch (error: any) {
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>${error?.message || 'RSS 피드를 생성할 수 없습니다'}</description>
  </channel>
</rss>`);
  }
}
