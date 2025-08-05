import { FindAndCountOptions, Model, OrderItem } from 'sequelize';
import { buildWhereClause } from './build-where';
import { buildSortClause } from './build-sort';
import { ZodObject } from 'zod';
import { QueryOptionsDto } from 'src/list-view';

export type AdditionalFields = {
  [key: string]: unknown;
};

type ClientOptions = QueryOptionsDto & AdditionalFields;

type ServerOptions<T> = FindAndCountOptions<T>;

export const buildDynamicQuery = <T extends Model>(
  schema: ZodObject<any>,
  serverOptions: ServerOptions<T>,
  clientOptions: ClientOptions
) => {
  const { filter, search, limit, order_by, order_type, page, skip, ...clientAdditionalFields } =
    clientOptions;

  const combinedWhere = buildWhereClause(
    serverOptions.where,
    clientOptions.filter,
    schema,
    clientOptions.search,
    clientAdditionalFields
  );

  const combinedSort = buildSortClause(
    clientOptions.order_by,
    clientOptions.order_type,
    serverOptions.order as OrderItem[]
  );

  const combinetOffset = Math.abs(
    clientOptions.skip
      ? clientOptions.skip
      : ((clientOptions.page ?? 1) - 1) * (clientOptions.limit ?? 0)
  );

  const findOptions: FindAndCountOptions<T> = {
    where: combinedWhere,
    include: serverOptions.include,
    limit: clientOptions.limit,
    offset: combinetOffset,
    order: combinedSort,
    group: serverOptions.group,
    distinct: serverOptions.distinct || true,
  };

  return findOptions;
};
