import { BaseEntity } from '../bases/base-entity';
import { FormatMaskedAdData } from './filterSubModels/format-masked-ad-data.model';
import { FormatAdData } from './filterSubModels/format-ad-data.model';
import { FormatMacAddress } from './filterSubModels/format-mac-address.model';
import { OutputDescription_shortId_track } from './filterSubModels/output-description-shortId-track.model';
import { OutputDescription_mac_report } from './filterSubModels/output-description-mac-report.model';
export declare type filterFormat = FormatMacAddress | FormatAdData | FormatMaskedAdData;
export declare type filterOutputDescription = OutputDescription_shortId_track | OutputDescription_mac_report;
declare const Asset_base: {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & typeof BaseEntity;
export declare class Asset extends Asset_base {
    id: string;
    name: string;
    description: string;
    type: string;
    cloudId: string;
    profileId: number;
    inputData: filterFormat;
    outputDescription: filterOutputDescription;
    data: string;
    filterId: string;
}
export {};
