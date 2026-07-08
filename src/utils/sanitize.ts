import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an HTML string to prevent Cross-Site Scripting (XSS) attacks.
 * This ensures that rendering user-generated content via dangerouslySetInnerHTML is safe.
 * 
 * @param html The raw HTML string to sanitize.
 * @returns A safe, sanitized HTML string.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
