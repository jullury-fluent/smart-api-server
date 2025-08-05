import { nestedToDotObject } from '../src/helpers';

describe('nestedToDotObject', () => {
  it('should convert nested objects to dot notation at the first level', () => {
    const input = {
      username: true,
      mail: true,
      activityScore: true,
      companyId: true,
      company: {
        name: true,
        industry: true,
        createdAt: true,
        revenue: true,
        employeeCount: true,
        users: true,
      },
      transactions: {
        id: true,
        amount: true,
        transactionType: true,
        blockchainNetwork: true,
      },
      createdAt: true,
      updatedAt: true,
    };

    const expected = {
      username: true,
      mail: true,
      activityScore: true,
      companyId: true,
      'company.name': true,
      'company.industry': true,
      'company.createdAt': true,
      'company.revenue': true,
      'company.employeeCount': true,
      'company.users': true,
      'transactions.id': true,
      'transactions.amount': true,
      'transactions.transactionType': true,
      'transactions.blockchainNetwork': true,
      createdAt: true,
      updatedAt: true,
    };

    const result = nestedToDotObject(input);
    expect(result).toEqual(expected);
  });

  it('should handle empty objects', () => {
    const input = {};
    const expected = {};
    const result = nestedToDotObject(input);
    expect(result).toEqual(expected);
  });

  it('should handle objects with no nested properties', () => {
    const input = {
      id: true,
      name: true,
      active: true,
    };
    const expected = {
      id: true,
      name: true,
      active: true,
    };
    const result = nestedToDotObject(input);
    expect(result).toEqual(expected);
  });

  it('should handle null and undefined values', () => {
    const input = {
      id: true,
      metadata: null,
      config: undefined,
      nested: {
        prop: true,
      },
    };
    const expected = {
      id: true,
      metadata: null,
      config: undefined,
      'nested.prop': true,
    };
    const result = nestedToDotObject(input);
    expect(result).toEqual(expected);
  });

  it('should not convert arrays to dot notation', () => {
    const input = {
      id: true,
      tags: ['tag1', 'tag2'],
      nested: {
        prop: true,
      },
    };
    const expected = {
      id: true,
      tags: ['tag1', 'tag2'],
      'nested.prop': true,
    };
    const result = nestedToDotObject(input);
    expect(result).toEqual(expected);
  });

  it('should only flatten the first level of nesting', () => {
    const input = {
      user: {
        profile: {
          name: true,
          age: true,
        },
        settings: true,
      },
    };
    const expected = {
      'user.profile': {
        name: true,
        age: true,
      },
      'user.settings': true,
    };
    const result = nestedToDotObject(input);
    expect(result).toEqual(expected);
  });
});
