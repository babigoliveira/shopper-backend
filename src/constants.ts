export const RECT_IMAGE_BASE_64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA' +
  'AgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAA' +
  'DklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';

export const IMAGE_MIME_TYPES_TO_EXTENSION = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpeg'],
  ['image/jpg', '.jpeg'],
  ['image/webp', '.webp'],
  ['image/heic', '.heic'],
  ['image/heif', '.heif'],
]);

export const MIME_TYPES_SIGNATURES = new Map([
  ['iVBORw0KGgo', 'image/png'],
  ['/9j/', 'image/jpeg'],
]);

export const IMAGE_EXTENSIONS_TO_MIME_TYPE = new Map([
  ['.png', 'image/png'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.heic', 'image/heic'],
  ['.heif', 'image/heif'],
]);
