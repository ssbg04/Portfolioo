import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_PROJECT_ID) || 
  (typeof process !== 'undefined' ? (process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID) : undefined);

const dataset = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_DATASET) || 
  (typeof process !== 'undefined' ? (process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET) : undefined);

const apiVersion = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_API_VERSION) || 
  (typeof process !== 'undefined' ? (process.env.PUBLIC_SANITY_API_VERSION || '2026-07-06') : '2026-07-06');

const token = (typeof import.meta !== 'undefined' && import.meta.env?.SANITY_READ_TOKEN) || 
  (typeof process !== 'undefined' ? (process.env.SANITY_READ_TOKEN || '') : '');

export const sanityClient = projectId 
  ? createClient({
      projectId,
      dataset: dataset || 'production',
      apiVersion,
      useCdn: true,
      token,
    })
  : null;

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'max' | 'crop' | 'fill' | 'fillmax';
}

export function urlFor(source: any, options?: ImageOptions): string {
  if (!source) return '';
  if (!builder) {
    return typeof source === 'string' ? source : '';
  }

  try {
    let img = builder.image(source);
    if (options?.width) img = img.width(options.width);
    if (options?.height) img = img.height(options.height);
    if (options?.fit) {
      img = img.fit(options.fit);
    } else if (options?.width || options?.height) {
      img = img.fit('max');
    }

    if (options?.format) {
      img = img.format(options.format);
    } else {
      img = img.auto('format');
    }

    img = img.quality(options?.quality ?? 80);
    return img.url();
  } catch {
    return typeof source === 'string' ? source : '';
  }
}

