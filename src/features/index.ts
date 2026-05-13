import type { FeatureDoc } from './types';

type ModuleShape = { default?: FeatureDoc } | FeatureDoc;

const modules = import.meta.glob('./content/*.json', { eager: true }) as Record<string, ModuleShape>;

const normalized = Object.values(modules)
  .map((entry) => {
    const candidate = (entry as { default?: FeatureDoc }).default ?? (entry as FeatureDoc);
    return candidate;
  })
  .filter((doc): doc is FeatureDoc => Boolean(doc?.slug && doc?.title));

export const featureDocs: FeatureDoc[] = normalized.sort((a, b) => a.title.localeCompare(b.title));

export const featureDocMap = new Map(featureDocs.map((doc) => [doc.slug, doc]));

export function getFeatureBySlug(slug?: string): FeatureDoc | null {
  if (!slug) return null;
  return featureDocMap.get(slug) ?? null;
}
