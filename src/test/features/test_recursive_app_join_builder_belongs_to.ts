import safe from "../..";
import { BbsCategory } from "../models/bbs/BbsCategory";

import { generate_random_recursive_category } from "../internal/generators/generate_radom_recursive_category";
import { must_not_query_anything } from "../internal/procedures/must_not_query_anything";

async function find_last_sibling(category: BbsCategory): Promise<BbsCategory>
{
    const children: BbsCategory[] = await category.children.get();
    if (children.length === 0)
        return category;
    
    const last: BbsCategory = children[children.length - 1];
    return await find_last_sibling(last);
}

export async function test_recursive_app_join_builder_belongs_to(): Promise<BbsCategory>
{
    const top: BbsCategory = await generate_random_recursive_category();
    const category: BbsCategory = await find_last_sibling(top);

    await safe.createAppJoinBuilder
    (
        BbsCategory, 
        category => category.join("parent")
    ).execute([ category ])

    await must_not_query_anything
    (
        "AppJoinBuilder.join() on recursive 'Belongs.ManyToOne' relationshiop",
        async () =>
        {
            let parent: BbsCategory | null = await category;
            while (parent !== null)
                parent = await parent.parent.get();
        }
    )
    return category;
}