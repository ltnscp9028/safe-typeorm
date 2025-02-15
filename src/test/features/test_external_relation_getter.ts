import safe from "../..";
import { collect_random_external_db } from "../internal/collectors/collect_random_external_db";
import { iterate_bbs_group } from "../internal/iterators/iterate_bbs_group";
import { BbsGroup } from "../models/bbs/BbsGroup";

export async function test_external_relation_getter(): Promise<void>
{
    const collection: safe.InsertCollection = new safe.InsertCollection();
    let { group } = await collect_random_external_db(collection);
    await collection.execute();

    group = await BbsGroup.findOneOrFail(group.id);
    await iterate_bbs_group(group, false);
}