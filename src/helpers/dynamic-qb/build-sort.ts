import { FindOptions, Order, OrderItem } from 'sequelize';

export const buildSortClause = (
  order_by: string,
  order_type: string,
  order: FindOptions['order']
): Order => {
  if (!order_by && !order_type) {
    return [];
  }

  if (order) {
    return order;
  }

  const sortDirection = (order_type ?? 'ASC').toUpperCase();

  const parts = order_by?.split('.');

  if (parts.length > 1) {
    const field = parts.pop();
    return [[...parts, field, sortDirection]] as OrderItem[];
  } else {
    return [[order_by, sortDirection]];
  }
};
