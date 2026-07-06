import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 
  (typeof process !== 'undefined' ? (process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID) : undefined);

const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 
  (typeof process !== 'undefined' ? (process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET) : undefined);

const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || 
  (typeof process !== 'undefined' ? (process.env.PUBLIC_SANITY_API_VERSION || '2026-07-06') : '2026-07-06');

const token = import.meta.env.SANITY_READ_TOKEN || 
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

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlFor(source: any) {
  return builder ? builder.image(source).url() : '';
}
