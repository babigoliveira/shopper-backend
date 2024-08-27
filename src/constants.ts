export const RECT_IMAGE_BASE_64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA' +
  'AgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAA' +
  'DklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';

export const IMAGE_MIME_TYPES_TO_EXTENSION = new Map([
  ['image/png', 'PNG'],
  ['image/jpeg', 'JPEG'],
  ['image/jpg', 'JPEG'],
  ['image/webp', 'WEBP'],
  ['image/heic', 'HEIC'],
  ['image/heif', 'HEIF'],
]);

export const IMAGE_EXTENSIONS_TO_MIME_TYPE = new Map([
  ['.png', 'image/png'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.heic', 'image/heic'],
  ['.heif', 'image/heif'],
]);
