import { searchableFields } from '../src/helpers/dynamic-qb/build-where';
import { z } from '@jullury-fluent/smart-api-common';

describe('searchableFields', () => {
  it('should return searchable fields from schema', () => {
    const schema = z.object({
      name: z.string().queryable(),
      email: z.string().queryable(),
      user: z.object({
        profile: z.string().queryable(),
      }),
    });

    const result = searchableFields(schema);

    expect(result).toContain('name');
    expect(result).toContain('email');
    expect(result).toContain('user.profile');
  });

  it('should handle empty queryable fields', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string(),
      age: z.number(),
    });

    const result = searchableFields(schema);

    expect(result).toEqual([]);
  });

  it('should handle nested fields correctly', () => {
    const schema = z.object({
      name: z.string().queryable(),
      user: z.object({
        profile: z
          .object({
            role: z.string().queryable(),
          })
          .queryable(),
      }),
      mail: z.string().queryable().path(['email']),
      company: z.object({
        address: z
          .object({
            city: z.string().queryable(),
          })
          .queryable(),
      }),
    });

    const result = searchableFields(schema);
    expect(result).toContain('name');
    expect(result).toContain('email');
    expect(result).toContain('user.profile');
    expect(result).toContain('company.address');
  });

  it('should handle dot notation in client filter objects', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          role: z.string().queryable(),
        }),
        settings: z.object({
          notifications: z.boolean().queryable(),
        }),
      }),
      company: z.object({
        id: z.string().queryable(),
      }),
    });

    const result = searchableFields(schema);

    expect(result).toContain('company.id');
  });

  it('should handle client filter objects with nested properties', () => {
    const schema = z.object({
      name: z.string().queryable(),
      company: z.object({
        id: z.string().queryable(),
      }),
    });

    const result = searchableFields(schema);

    expect(result).toContain('name');
    expect(result).toContain('company.id');
  });
});
