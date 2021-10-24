import { Belongs } from "../../decorators";
import { ReflectAdaptor } from "../../decorators/base/ReflectAdaptor";

import { Creator } from "../../typings/Creator";
import { Field } from "../../typings/Field";
import { SpecialFields } from "../../typings/SpecialFields";

export function get_column_name_tuple<
        T extends object, 
        Literal extends SpecialFields<T, Field>>
    (
        creator: Creator<T>, 
        fieldLike: `${Literal}` | `${string}.${Literal}`
    ): [string, string]
{
    const index: number = (<string>fieldLike).indexOf(".");
    let tableAlias: string;
    let field: Literal;

    if (index === -1)
    {
        tableAlias = creator.name;
        field = fieldLike as Literal;
    }
    else
    {
        tableAlias = (<string>fieldLike).substr(0, index);
        field = (<string>fieldLike).substr(index + 1) as Literal;
    }

    const metadata: ReflectAdaptor.Metadata<T, any> | undefined = ReflectAdaptor.get(creator.prototype, field);
    const fieldName: string = (metadata as Belongs.ManyToOne.IMetadata<T>)?.foreign_key_field || field;
    return [tableAlias, fieldName];
}