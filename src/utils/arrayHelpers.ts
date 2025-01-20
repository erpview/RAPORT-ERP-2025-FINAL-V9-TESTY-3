export const parseArrayInput = (value: string): string[] => {
  // Handle PostgreSQL array format
  if (value.startsWith('{') && value.endsWith('}')) {
    return value.slice(1, -1).split(',').map(item => item.trim()).filter(Boolean);
  }
  
  // Handle quoted values with commas
  const matches = value.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  if (!matches) return [];
  
  return matches.map(item => 
    item.startsWith('"') && item.endsWith('"') 
      ? item.slice(1, -1).trim()
      : item.trim()
  ).filter(Boolean);
};

export const formatArrayOutput = (arr: string[] | undefined | null): string => {
  if (!arr || arr.length === 0) return '';
  
  return arr.map(item => 
    item.includes(',') ? `"${item}"` : item
  ).join(', ');
};