// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  CallReducerFlags,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  DbContext,
  ErrorContextInterface,
  Event,
  EventContextInterface,
  Identity,
  ProductType,
  ProductTypeElement,
  ReducerEventContextInterface,
  SubscriptionBuilderImpl,
  SubscriptionEventContextInterface,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
} from "@clockworklabs/spacetimedb-sdk";
import { GridSquareData } from "./grid_square_data_type";
import { EventContext, Reducer, RemoteReducers, RemoteTables } from ".";

/**
 * Table handle for the table `grid_square`.
 *
 * Obtain a handle from the [`gridSquare`] property on [`RemoteTables`],
 * like `ctx.db.gridSquare`.
 *
 * Users are encouraged not to explicitly reference this type,
 * but to directly chain method calls,
 * like `ctx.db.gridSquare.on_insert(...)`.
 */
export class GridSquareTableHandle {
  tableCache: TableCache<GridSquareData>;

  constructor(tableCache: TableCache<GridSquareData>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<GridSquareData> {
    return this.tableCache.iter();
  }
  /**
   * Access to the `key` unique index on the table `grid_square`,
   * which allows point queries on the field of the same name
   * via the [`GridSquareKeyUnique.find`] method.
   *
   * Users are encouraged not to explicitly reference this type,
   * but to directly chain method calls,
   * like `ctx.db.gridSquare.key().find(...)`.
   *
   * Get a handle on the `key` unique index on the table `grid_square`.
   */
  key = {
    // Find the subscribed row whose `key` column value is equal to `col_val`,
    // if such a row is present in the client cache.
    find: (col_val: string): GridSquareData | undefined => {
      for (let row of this.tableCache.iter()) {
        if (deepEqual(row.key, col_val)) {
          return row;
        }
      }
    },
  };

  onInsert = (cb: (ctx: EventContext, row: GridSquareData) => void) => {
    return this.tableCache.onInsert(cb);
  }

  removeOnInsert = (cb: (ctx: EventContext, row: GridSquareData) => void) => {
    return this.tableCache.removeOnInsert(cb);
  }

  onDelete = (cb: (ctx: EventContext, row: GridSquareData) => void) => {
    return this.tableCache.onDelete(cb);
  }

  removeOnDelete = (cb: (ctx: EventContext, row: GridSquareData) => void) => {
    return this.tableCache.removeOnDelete(cb);
  }

  // Updates are only defined for tables with primary keys.
  onUpdate = (cb: (ctx: EventContext, oldRow: GridSquareData, newRow: GridSquareData) => void) => {
    return this.tableCache.onUpdate(cb);
  }

  removeOnUpdate = (cb: (ctx: EventContext, onRow: GridSquareData, newRow: GridSquareData) => void) => {
    return this.tableCache.removeOnUpdate(cb);
  }}
