import { z } from 'zod';
import { getPath } from '@jullury-fluent/smart-api-common';

function flattenSortKeys(obj: Record<string, any>, prefix: string[] = []): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    const path = [...prefix, key];

    if (value === true) {
      keys.push(path.join('.'));
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...flattenSortKeys(value, path));
    }
  }

  return keys;
}

function buildSortPath(
  schema: z.ZodObject<any>,
  clientSortObj: Record<string, any>
): string | null {
  const pathMap = getPath(schema);
  const flattenedKeys = flattenSortKeys(clientSortObj);

  for (const key of flattenedKeys) {
    if (pathMap[key]) return pathMap[key];
  }

  return null;
}

export { buildSortPath };
