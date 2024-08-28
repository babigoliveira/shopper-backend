import * as fs from 'node:fs';

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

export const MEASURE_IMAGE_BASE_64_EXAMPLE = fs
  .readFileSync('static/measure-image-base64-example.txt')
  .toString();
