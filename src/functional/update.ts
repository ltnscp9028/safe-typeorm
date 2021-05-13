import * as orm from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { Has } from "../decorators/Has";

import { Creator } from "../typings";
import { ITableInfo } from "./internal/ITableInfo";

const DICT: WeakMap<Creator<object>, ColumnMetadata[]> = new WeakMap();

export function update<T extends object>(record: T): Promise<void>;
export function update<T extends object>(manager: orm.EntityManager, record: T): Promise<void>;

export function update<T extends object>
    (...args: [T] | [orm.EntityManager, T]): Promise<void>
{
    if (args.length === 1)
        return _Update(orm.getManager(), args[0]);
    else
        return _Update(...args);
}

async function _Update<T extends object>
    (manager: orm.EntityManager, record: T): Promise<void>
{
    // PREPARE ASSETS
    const creator: Creator<T> = record.constructor as Creator<T>;
    const info: ITableInfo = ITableInfo.get(creator);

    let columnList: ColumnMetadata[] | undefined = DICT.get(creator);
    if (columnList === undefined)
    {
        columnList = manager.getRepository(creator).metadata.columns;
        DICT.set(creator, columnList);
    }

    // ASSIGN PROPERTIES FOR UPDATENCE
    const props: any = {};
    for (const column of columnList)
    {
        const key: string = column.propertyName;
        props[key] = (record as any)[key];
    }
    if (info.updateDateColumn)
    {
        const date: Date = new Date();
        props[info.updateDateColumn] = date;
        (record as any)[info.updateDateColumn] = date;
    }

    // DO UPDATE
    const field: string = Has.getPrimaryField(`${creator.name}.update`, creator);
    await manager
        .getRepository(creator)
        .update((record as any)[field], props);
}