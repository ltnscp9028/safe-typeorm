import { randint } from "tstl";
import safe from "../../..";
import { ArrayUtil } from "../../../utils/ArrayUtil";
import { BbsArticle } from "../../models/BbsArticle";
import { BbsArticleContent } from "../../models/BbsArticleContent";
import { BbsGroup } from "../../models/BbsGroup";
import { collect_random_bbs_article_content } from "./collect_random_bbs_article_content";
import { prepare_random_bbs_article } from "../preparations/prepare_random_bbs_article";
import { __MvBbsArticleLastContentPair } from "../../models/__MvBbsArticleLastContentPair";

export async function collect_random_bbs_article
    (
        collection: safe.InsertCollection,
        group: BbsGroup,
        created_at: Date = new Date(),
        contentCount: number = randint(1, 4),
        fileCount: () => number = () => randint(0, 9)
    ): Promise<BbsArticle>
{
    const article: BbsArticle = prepare_random_bbs_article(group, created_at);
    const contents: BbsArticleContent[] = await ArrayUtil.asyncRepeat
    (
        contentCount, 
        index => collect_random_bbs_article_content
        (
            collection, 
            article, 
            new Date(created_at.getTime() + index * 1000),
            fileCount()
        )
    );
    const last: __MvBbsArticleLastContentPair = __MvBbsArticleLastContentPair.initialize({
        article,
        content: contents[contents.length - 1]
    });
    collection.push(last);
    await article.__mv_last.set(last);

    await article.contents.set(contents);
    return collection.push(article);
}