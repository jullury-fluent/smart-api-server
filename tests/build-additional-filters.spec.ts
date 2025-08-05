import { Op } from 'sequelize';
import { AdditionalFields } from '../src/helpers/dynamic-qb/dynamic-qb';
import { buildAdditionalFilters } from '../src/helpers/dynamic-qb/build-where';
import { z } from '@jullury-fluent/smart-api-common';

describe('buildAdditionalFilters', () => {
  it('should transform each value in additionalFields to use Op.in operator', () => {
    const schema = z.object({
      userId: z.number().queryable(),
      status: z.string().queryable(),
    });

    const additionalFields: AdditionalFields = {
      userId: [1, 2, 3],
      status: ['active', 'pending'],
    };

    const result = buildAdditionalFilters(schema, { ...additionalFields });

    expect(result).toEqual({
      userId: { [Op.in]: [1, 2, 3] },
      status: {
        [Op.or]: [{ [Op.iLike]: 'active' }, { [Op.iLike]: 'pending' }],
      },
    });
  });

  it('should handle empty additionalFields object', () => {
    const schema = z.object({
      userId: z.number().queryable(),
      status: z.string().queryable(),
    });

    const additionalFields: AdditionalFields = {};

    const result = buildAdditionalFilters(schema, additionalFields);

    expect(result).toEqual({});
  });

  it('should handle additionalFields with single values', () => {
    const schema = z.object({
      userId: z.number().queryable(),
      status: z.string().queryable(),
    });

    const additionalFields: AdditionalFields = {
      userId: [5],
      status: ['completed'],
    };

    const result = buildAdditionalFilters(schema, { ...additionalFields });

    expect(result).toEqual({
      userId: { [Op.in]: [5] },
      status: {
        [Op.or]: [{ [Op.iLike]: 'completed' }],
      },
    });
  });

  it('should handle additionalFields with non-array values', () => {
    const schema = z.object({
      userId: z.number().queryable(),
      status: z.string().queryable(),
    });

    const additionalFields: AdditionalFields = {
      userId: 5,
      status: 'completed',
    };

    const result = buildAdditionalFilters(schema, { ...additionalFields });

    expect(result).toEqual({
      userId: { [Op.in]: [5] },
      status: {
        [Op.or]: [{ [Op.iLike]: 'completed' }],
      },
    });
  });

  it('should handle additionalFields with mixed value types', () => {
    const schema = z.object({
      userId: z.number().queryable(),
      status: z.string().queryable(),
      tags: z.array(z.string()).queryable(),
    });

    const additionalFields: AdditionalFields = {
      userId: [1, 2, 3],
      status: 'active',
      tags: ['important', 'urgent'],
    };

    const result = buildAdditionalFilters(schema, { ...additionalFields });

    expect(result).toEqual({
      userId: { [Op.in]: [1, 2, 3] },
      status: {
        [Op.or]: [{ [Op.iLike]: 'active' }],
      },
      tags: {
        [Op.or]: [{ [Op.iLike]: 'important' }, { [Op.iLike]: 'urgent' }],
      },
    });
  });
});
