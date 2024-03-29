import { BaseEntity } from '../bases/base-entity';
import { Asset, filterFormat, filterOutputDescription } from './asset.model';
declare const AssetFilter_base: {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & typeof BaseEntity;
export declare class AssetFilter extends AssetFilter_base {
    id: string;
    cloudId: string;
    type: filterType_t;
    idOnCrownstone: number;
    profileId: number;
    exclude: boolean;
    possibleWithinProtocol: boolean;
    inputData: filterFormat;
    outputDescription: filterOutputDescription;
    data: string;
    dataCRC: string;
    assets: Asset[];
    filterSetId: string;
}
export {};
