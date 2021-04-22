import { DatabaseInfoRepository, EnergyDataRepository, HubRepository, PowerDataRepository, SphereFeatureRepository, SwitchDataRepository, UserPermissionRepository, UserRepository } from '../../repositories';
import { EnergyDataProcessedRepository } from '../../repositories/hub-specific/energy-data-processed.repository';
import { AssetRepository } from '../../repositories/cloud/asset.repository';
import { AssetFilterRepository } from '../../repositories/cloud/asset-filter.repository';
import { AssetFilterSetRepository } from '../../repositories/cloud/asset-filter-set.repository';
declare class DbReferenceClass {
    dbInfo: DatabaseInfoRepository;
    hub: HubRepository;
    power: PowerDataRepository;
    energy: EnergyDataRepository;
    energyProcessed: EnergyDataProcessedRepository;
    sphereFeatures: SphereFeatureRepository;
    switches: SwitchDataRepository;
    user: UserRepository;
    userPermission: UserPermissionRepository;
    assets: AssetRepository;
    assetFilters: AssetFilterRepository;
    assetFilterSets: AssetFilterSetRepository;
}
export declare const Dbs: DbReferenceClass;
export {};
