import { buildSortClause } from '../src/helpers/dynamic-qb/build-sort';
import { Order, OrderItem } from 'sequelize';

describe('buildSortClause', () => {
  it('should return empty array when no order_by and order_type are provided', () => {
    const result = buildSortClause(undefined, undefined, undefined);
    expect(result).toEqual([]);
  });

  it('should return the provided order when it exists', () => {
    const mockOrder: Order = [['id', 'DESC']];
    const result = buildSortClause('name', 'ASC', mockOrder);
    expect(result).toEqual(mockOrder);
  });

  it('should build sort clause with default ASC direction when order_type is not provided', () => {
    const result = buildSortClause('name', undefined, undefined);
    expect(result).toEqual([['name', 'ASC']]);
  });

  it('should build sort clause with specified direction', () => {
    const result = buildSortClause('name', 'DESC', undefined);
    expect(result).toEqual([['name', 'DESC']]);
  });

  it('should handle case insensitivity for order_type', () => {
    const result = buildSortClause('name', 'desc', undefined);
    expect(result).toEqual([['name', 'DESC']]);
  });

  it('should handle dot notation for nested fields', () => {
    const result = buildSortClause('user.profile.firstName', 'ASC', undefined);
    expect(result).toEqual([
      ['user', 'profile', 'firstName', 'ASC'],
    ] as OrderItem[]);
  });

  it('should handle dot notation with multiple levels', () => {
    const result = buildSortClause('company.address.city', 'DESC', undefined);
    expect(result).toEqual([
      ['company', 'address', 'city', 'DESC'],
    ] as OrderItem[]);
  });
});
