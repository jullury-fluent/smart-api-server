/* -----------------------------------
 * Types
 * ----------------------------------- */

import { FindAttributeOptions, Op } from 'sequelize';

export type SequelizeOperator = keyof typeof Op;
export type SequelizeOperatorSymbol = (typeof Op)[keyof typeof Op];

type OperatorObject = {
  [key in SequelizeOperator]?: string | number | boolean | (string | number)[];
};

type FilterValue = string | number | boolean | OperatorObject | FilterObject;

export type FilterObject = {
  [key: string]: FilterValue;
};

export type OperatorSymbolObject = {
  [key in SequelizeOperatorSymbol]?: string | number | boolean | (string | number)[];
};

export type FilterValueWithSymbols =
  | string
  | number
  | boolean
  | OperatorSymbolObject
  | FilterObjectWithSymbols;

export interface FilterObjectWithSymbols {
  [key: string]: FilterValueWithSymbols;
}

export type GetAttributesModel = Record<string, FindAttributeOptions>;

export interface ModelWithAttributes {
  getAttributes: () => GetAttributesModel;
}
