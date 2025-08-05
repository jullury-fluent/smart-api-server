import { Op, WhereOptions } from 'sequelize';
import { AdditionalFields } from './dynamic-qb';
import { FilterObject } from './types';
import { buildFilterQuery, nestedToDotObject } from '../utils';
import { ZodObject } from 'zod';
import { getQueryable, ZodTypeWithQueryable } from '@jullury-fluent/smart-api-common';
/* -----------------------------------
 * Operator & Wildcard Utilities
 * ----------------------------------- */

export const searchableFields = (schema: ZodObject<ZodTypeWithQueryable<any>>): string[] => {
  const searchable = getQueryable(schema);
  return Object.keys(nestedToDotObject(searchable));
};

export function buildSearchQuery(schema: ZodObject<any>, clientQuery: string): WhereOptions {
  if (!clientQuery) {
    return {};
  }
  const availableFields = searchableFields(schema);
  return {
    [Op.or]: availableFields.map(field => ({
      [field.includes('.') ? `$${field}$` : field]: {
        [Op.iLike]: `%${clientQuery}%`,
      },
    })),
  };
}

export function buildAdditionalFilters(schema: ZodObject<any>, additionalFields: AdditionalFields) {
  const shape = schema.shape;

  const additionalFilters: AdditionalFields = {};
  for (const [key, value] of Object.entries(additionalFields)) {
    const newValue = Array.isArray(value) ? value : [value];
    let mappedKey = key;
    if (shape[key] && 'isPath' in shape[key] && shape[key].isPath()) {
      mappedKey = shape[key].description?.path?.join('.');
    }
    if (mappedKey.includes('.')) {
      mappedKey = `$${mappedKey}$`;
    }
    if (newValue.some(v => typeof v === 'string')) {
      const conditions = newValue.map(v => {
        if (typeof v === 'string') {
          return { [Op.iLike]: v };
        }
        return v;
      });
      additionalFilters[mappedKey] = { [Op.or]: conditions };
    } else {
      additionalFilters[mappedKey] = { [Op.in]: newValue };
    }
  }

  return additionalFilters;
}

/* -----------------------------------
 * Main Dynamic Query Builder
 * ----------------------------------- */

export const buildWhereClause = <T extends FilterObject>(
  serverWhere: WhereOptions<T> = {},
  clientFilter: FilterObject,
  schema: ZodObject<any>,
  searchText: string = undefined,
  additionalFields: AdditionalFields = {} as AdditionalFields
): WhereOptions<T> => {
  const textSearchConditions = buildSearchQuery(schema, searchText);
  const sequelizeFilterQuery = buildFilterQuery(schema, clientFilter);
  const additionalFilters = buildAdditionalFilters(schema, additionalFields);

  const whereClause = {
    [Op.and]: [serverWhere, textSearchConditions, additionalFilters, sequelizeFilterQuery].filter(
      Boolean
    ),
  };

  return whereClause;
};
