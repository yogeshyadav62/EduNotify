export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const getFileExtensionIcon = (filename: string): string => {
  if (!filename) return 'document-outline';
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'document-text';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image-outline';
    case 'doc':
    case 'docx':
      return 'document-text-outline';
    default:
      return 'link-outline';
  }
};
