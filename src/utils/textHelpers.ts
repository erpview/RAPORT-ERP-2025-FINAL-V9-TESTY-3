/**
 * Strips HTML tags from a string and truncates it to a specified length
 * @param html The HTML string to process
 * @param maxLength Maximum length of the output string
 * @returns The processed string
 */
export function stripHtmlAndTruncate(html: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Truncate if necessary
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Find the last space before maxLength
  const lastSpace = cleanText.lastIndexOf(' ', maxLength);
  if (lastSpace === -1) {
    return cleanText.slice(0, maxLength) + '...';
  }
  
  return cleanText.slice(0, lastSpace) + '...';
}
