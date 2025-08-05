import { Op } from 'sequelize';
import * as buildWhereModule from '../src/helpers/dynamic-qb/build-where';
import { AdditionalFields } from '../src/helpers/dynamic-qb/dynamic-qb';
import { ZodObject } from 'zod';

describe('buildWhereClause', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should handle empty inputs', () => {
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;

    const result = buildWhereModule.buildWhereClause(
      {},
      {},
      mockSchema,
      '',
      {} as AdditionalFields,
    );
    expect(result).toEqual({
      [Op.and]: [{}, {}, {}, {}],
    });
  });

  it('should filter out falsy conditions', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = {};
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;
    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      '',
      {} as AdditionalFields,
    );
    expect(result).toEqual({
      [Op.and]: [{ status: 'active' }, {}, {}, {}],
    });
  });

  it('should handle undefined searchText', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = { type: 'user' };
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;
    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      undefined,
      {} as AdditionalFields,
    );
    expect(result).toEqual({
      [Op.and]: [{ status: 'active' }, {}, {}, {}],
    });
  });

  it('should handle empty schema', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = { type: 'user' };
    const searchText = 'test';
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;
    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      searchText,
      {} as AdditionalFields,
    );
    expect(result).toEqual({
      [Op.and]: [{ status: 'active' }, { [Op.or]: [] }, {}, {}],
    });
  });

  it('should handle undefined additionalFields', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = { type: 'user' };
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;
    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      '',
      {} as AdditionalFields,
    );
    expect(result).toEqual({
      [Op.and]: [{ status: 'active' }, {}, {}, {}],
    });
  });

  it('should handle complex nested conditions', () => {
    const serverWhere = {
      [Op.and]: [
        { status: 'active' },
        { createdAt: { [Op.gt]: new Date('2023-01-01') } },
      ],
    };

    const clientFilter = {
      [Op.or]: [{ type: 'user' }, { type: 'admin' }],
    };

    const searchText = 'test';
    const mockSchema = {
      shape: {
        name: { isQueryable: () => true },
        description: { isQueryable: () => true },
        id: { isQueryable: () => false },
      },
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;

    const additionalFields = { role: ['admin'] } as AdditionalFields;

    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      searchText,
      additionalFields,
    );

    expect(result).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { status: 'active' },
            { createdAt: { [Op.gt]: new Date('2023-01-01') } },
          ],
        },
        {
          [Op.or]: [
            { name: { [Op.iLike]: '%test%' } },
            { description: { [Op.iLike]: '%test%' } },
          ],
        },
        {
          role: {
            [Op.or]: [{ [Op.iLike]: 'admin' }],
          },
        },
        {},
      ],
    });
  });

  it('should combine search text with schema fields', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = { type: 'user' };
    const searchText = 'test';
    const mockSchema = {
      shape: {
        name: { isQueryable: () => true },
        description: { isQueryable: () => true },
        id: { isQueryable: () => false },
      },
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;

    // Using real implementation

    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      searchText,
      {} as AdditionalFields,
    );

    expect(result).toEqual({
      [Op.and]: [
        { status: 'active' },
        {
          [Op.or]: [
            { name: { [Op.iLike]: '%test%' } },
            { description: { [Op.iLike]: '%test%' } },
          ],
        },
        {},
        {},
      ],
    });
  });

  it('should handle nested properties in clientFilter', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = {
      'user.profile.role': { eq: 'admin' },
      'user.settings.notifications': { eq: true },
      'company.id': { gte: 123 },
    };
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;

    // Using real implementation

    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      undefined,
      {} as AdditionalFields,
    );

    // With real implementation, the nested properties use Sequelize's $ notation
    expect(result).toEqual({
      [Op.and]: [
        { status: 'active' },
        {},
        {},
        {
          '$user.profile$': { [Op.eq]: 'admin' },
          '$user.settings$': { [Op.eq]: true },
          '$company.id$': { [Op.gte]: 123 },
        },
      ],
    });
  });

  it('should handle nested properties in additionalFields', () => {
    const serverWhere = { status: 'active' };
    const clientFilter = { type: 'user' };
    const mockSchema = {
      shape: {},
      _getCached: jest.fn(),
      _parse: jest.fn(),
      _cached: null,
    } as unknown as ZodObject<any>;

    const additionalFields = {
      'user.roles': ['admin', 'manager'],
      'user.permissions.level': 'advanced',
    } as AdditionalFields;

    // Using real implementation

    const result = buildWhereModule.buildWhereClause(
      serverWhere,
      clientFilter,
      mockSchema,
      undefined,
      additionalFields,
    );

    // With real implementation, the nested properties use Sequelize's $ notation
    expect(result).toEqual({
      [Op.and]: [
        { status: 'active' },
        {},
        {
          '$user.roles$': {
            [Op.or]: [{ [Op.iLike]: 'admin' }, { [Op.iLike]: 'manager' }],
          },
          '$user.permissions.level$': {
            [Op.or]: [{ [Op.iLike]: 'advanced' }],
          },
        },
        {},
      ],
    });
  });
});
