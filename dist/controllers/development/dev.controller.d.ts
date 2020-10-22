import { UserProfileDescription } from '../../security/authentication-strategies/csToken-strategy';
import { EnergyDataProcessedRepository, EnergyDataRepository } from '../../repositories';
export declare class DevController {
    protected energyDataProcessedRepo: EnergyDataProcessedRepository;
    protected energyDataRepo: EnergyDataRepository;
    constructor(energyDataProcessedRepo: EnergyDataProcessedRepository, energyDataRepo: EnergyDataRepository);
    getRawEnergyData(userProfile: UserProfileDescription, crownstoneUID: number, from: Date, until: Date, limit: number): Promise<import("../../models").EnergyData[]>;
    reprocessEnergyData(userProfile: UserProfileDescription): Promise<void>;
    reprocessEnergyAggregates(userProfile: UserProfileDescription): Promise<void>;
    reprocessEnergyDataStatus(userProfile: UserProfileDescription): Promise<any>;
    reprocessEnergyAggregatesStatus(userProfile: UserProfileDescription): Promise<any>;
}
