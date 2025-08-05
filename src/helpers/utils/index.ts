import { getPath, setNestedKey } from '@jullury-fluent/smart-api-common';
import { Op } from 'sequelize';
import { z } from 'zod';
import { FilterObject } from '../dynamic-qb';

export const sequelizeOperators = Object.keys(Op) as Array<keyof typeof Op>;

export function isSequelizeOperator(key: string): key is keyof typeof Op {
  return sequelizeOperators.includes(key as any);
}

export function isLikeSequelizeOperator(key: string): boolean {
  return ['like', 'iLike', 'notLike', 'notILike'].includes(key);
}

export function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (typeof val !== 'object' || val === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
}

export const sequelizeOperatorValidators: Record<string, z.ZodTypeAny> = {
  eq: z.union([z.string(), z.number(), z.boolean(), z.null(), z.date()]),
  ne: z.union([z.string(), z.number(), z.boolean(), z.null(), z.date()]),
  gt: z.union([z.number(), z.date(), z.string()]),
  gte: z.union([z.number(), z.date(), z.string()]),
  lt: z.union([z.number(), z.date(), z.string()]),
  lte: z.union([z.number(), z.date(), z.string()]),
  in: z.array(z.any()),
  notIn: z.array(z.any()),
  like: z.string().refine(val => !val.includes('%'), {
    message: "Value must not contain '%' character",
  }),
  notLike: z.string().refine(val => !val.includes('%'), {
    message: "Value must not contain '%' character",
  }),
  iLike: z.string().refine(val => !val.includes('%'), {
    message: "Value must not contain '%' character",
  }),
  notILike: z.string().refine(val => !val.includes('%'), {
    message: "Value must not contain '%' character",
  }),
  between: z.tuple([z.any(), z.any()]),
  notBetween: z.tuple([z.any(), z.any()]),
  is: z.union([z.null(), z.boolean()]),
  not: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  or: z.array(z.any()),
  and: z.array(z.any()),
  startsWith: z.string(),
  endsWith: z.string(),
  substring: z.string(),
};

export function validateOperatorInput(operator: string, value: unknown) {
  const schema = sequelizeOperatorValidators[operator];
  if (!schema) throw new Error(`Unsupported operator: ${operator}`);
  try {
    schema.parse(value);
  } catch (err) {
    console.error(err.errors.map(e => e.message).join(', '));
    return [null, err];
  }
  return [true, null];
}

interface ClientFilter {
  [key: string]: unknown;
}

interface FilterMap {
  [key: string]: unknown;
}

export function validateOptions(
  clientFilter: ClientFilter,
  filterMap: FilterMap
): [true, null] | [null, string | z.ZodError] {
  const nestedFilterMap = nestedToDotObject(filterMap);
  for (const [key, value] of Object.entries(clientFilter)) {
    if (!nestedFilterMap.hasOwnProperty(key) && !sequelizeOperatorValidators[key]) {
      return [null, `Invalid key: ${key}`];
    }
    if (sequelizeOperatorValidators[key]) {
      const [_, err] = validateOperatorInput(key, value);
      if (err) return [null, err];
    } else if (Object.keys(value as object).length > 0) {
      Object.keys(value as object).forEach(k => {
        if (!sequelizeOperatorValidators[k]) {
          return [null, `Invalid key: ${k}`];
        }
      });
    } else if (!nestedFilterMap.hasOwnProperty(key)) {
      return [null, `Invalid key: ${key}`];
    }
  }
  return [true, null];
}

export function nestedToDotObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.keys(obj[key]).forEach(nestedKey => {
        result[`${key}.${nestedKey}`] = obj[key][nestedKey];
      });
    } else {
      result[key] = obj[key];
    }
  });

  return result;
}

export function getFilterable<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  visited = new WeakSet()
): Record<string, unknown> {
  if (visited.has(schema)) {
    return {};
  }

  visited.add(schema);

  const filterable: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(schema.shape)) {
    const value = v as any;

    if (!value) continue;

    if (value instanceof z.ZodLazy) {
      try {
        const lazyValue = value._def.getter();
        if (lazyValue instanceof z.ZodObject) {
          if (!visited.has(lazyValue)) {
            const nested = getFilterable(lazyValue, visited);
            if (Object.keys(nested).length) filterable[key] = nested;
          }
          continue;
        } else if (lazyValue instanceof z.ZodArray && lazyValue._def.type instanceof z.ZodObject) {
          if (!visited.has(lazyValue._def.type)) {
            const nested = getFilterable(lazyValue._def.type, visited);
            if (Object.keys(nested).length) filterable[key] = nested;
          }
          continue;
        }
      } catch (e) {
        continue;
      }
    }

    if (value instanceof z.ZodObject) {
      if (!visited.has(value)) {
        const nested = getFilterable(value, visited);
        if (Object.keys(nested).length) filterable[key] = nested;
      }
      continue;
    }

    if (value instanceof z.ZodArray && value._def.type instanceof z.ZodObject) {
      if (!visited.has(value._def.type)) {
        const nested = getFilterable(value._def.type, visited);
        if (Object.keys(nested).length) filterable[key] = nested;
      }
      continue;
    }

    if (
      'isFilterable' in value &&
      typeof value.isFilterable === 'function' &&
      value.isFilterable()
    ) {
      setNestedKey(filterable, [key], true);
    }
  }

  return filterable;
}

export const buildFilterQuery = (
  schema: z.ZodObject<any>,
  filter: FilterObject | string
): FilterObject => {
  if (!filter) return {};
  const sequelizeFilter: FilterObject = {};

  const path = getPath(schema);
  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (e) {
      throw new Error(`Invalid filter JSON: ${e.message}`);
    }
  }

  if (!isPlainObject(filter)) {
    throw new Error('Filter must be a plain object');
  }

  if (Object.keys(filter).length === 0) {
    return {};
  }

  for (const key in filter) {
    const pathKey = path[key] || key;
    const value = filter[key];

    if (isPlainObject(value)) {
      if (pathKey.includes('.')) {
        const [association, field] = pathKey.split('.');
        for (const [subKey, subValue] of Object.entries(value)) {
          if (isSequelizeOperator(subKey)) {
            sequelizeFilter[`$${association}.${field}$`] =
              sequelizeFilter[`$${association}.${field}$`] || {};

            Object.assign(sequelizeFilter[`$${association}.${field}$`], {
              [Op[subKey]]: subValue,
            });
          } else if (isLikeSequelizeOperator(subKey)) {
            sequelizeFilter[`$${association}.${field}$`] =
              sequelizeFilter[`$${association}.${field}$`] || {};

            Object.assign(sequelizeFilter[`$${association}.${field}$`], {
              [Op[subKey]]: `%${subValue}%`,
            });
          } else {
            throw new Error(`Unsupported operator "${subKey}" in filter key: "${key}"`);
          }
        }
      } else {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (isSequelizeOperator(subKey)) {
            sequelizeFilter[pathKey] = sequelizeFilter[pathKey] || {};
            Object.assign(sequelizeFilter[pathKey], {
              [Op[subKey]]: subValue,
            });
          } else if (isLikeSequelizeOperator(subKey)) {
            sequelizeFilter[pathKey] = sequelizeFilter[pathKey] || {};
            Object.assign(sequelizeFilter[pathKey], {
              [Op[subKey]]: `%${subValue}%`,
            });
          } else {
            throw new Error(`Unsupported operator "${subKey}" in filter key: "${key}"`);
          }
        }
      }
    }
  }

  return sequelizeFilter;
};
