import {Count, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import { EnergyDataProcessedRepository, EnergyDataRepository, UserRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {SecurityTypes} from '../constants/Constants';
import {fillWithStoneData, MemoryDb} from '../crownstone/data/MemoryDb';
import {IntervalData} from '../crownstone/processing/IntervalData';

/**
 * This controller will echo the state of the hub.
 */
export class EnergyController {

  constructor(
    @repository(EnergyDataProcessedRepository) protected energyDataProcessedRepo: EnergyDataProcessedRepository,
    @repository(EnergyDataRepository) protected energyDataRepo: EnergyDataRepository,
  ) {}


  @get('/energyAvailability')
  @authenticate(SecurityTypes.sphere)
  async getEnergyAvailability(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<{crownstoneUID: number, name: string, locationName: string, count: number}[]> {
    let stones = MemoryDb.stones;
    let result = [];
    for (let uid in stones) {
      let data : any = fillWithStoneData(uid);
      result.push(data);
    }
    return result;

    // let collection = this.energyDataProcessedRepo.dataSource.connector?.collection("EnergyDataProcessed");
    // if (collection) {
    //   let result = [];
    //   let uids = await collection.distinct('stoneUID');
    //   for (let i = 0; i < uids.length; i++) {
    //     let data : any = fillWithStoneData(uids[i]);
    //     data.count = 0;
    //     if (data.cloudId) {
    //       let countData = await this.energyDataProcessedRepo.count({stoneUID: uids[i], interval: '1m' });
    //       if (countData) {
    //         data.count = countData.count;
    //       }
    //       result.push(data);
    //     }
    //   }
    //   return result;
    // }
    throw new HttpErrors.InternalServerError("Could not get distinct list");
  }


  @get('/energyRange')
  @authenticate(SecurityTypes.sphere)
  async getEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.dateTime('from', {required:false}) from: Date,
    @param.query.dateTime('until', {required:false}) until: Date,
    @param.query.number('limit', {required:true}) limit: number,
    @param.query.string('interval', {required:false}) interval: Interval,
  ) {
    let useInterval = '1m'
    if (interval === '1m' || IntervalData[interval] !== undefined) {
      useInterval = interval;
    }

    let filters : any[] = [{stoneUID:crownstoneUID, interval: useInterval }];
    if (from)  { filters.push({timestamp:{gte: from}})  }
    if (until) { filters.push({timestamp:{lte: until}}) }

    let query = {where: {and: filters}, limit: limit, fields:{energyUsage: true, timestamp: true}, order: 'timestamp ASC'}
    // @ts-ignore
    return await this.energyDataProcessedRepo.find(query)
  }

  @del('/energyFromCrownstone')
  @authenticate(SecurityTypes.admin)
  async deleteStoneEnergy(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.dateTime('from', {required:false}) from: Date,
    @param.query.dateTime('until', {required:false}) until: Date,
  ) : Promise<Count> {
    let filters : any[] = [{stoneUID:crownstoneUID}];
    if (from)  { filters.push({timestamp:{gte: from}})  }
    if (until) { filters.push({timestamp:{lte: until}}) }
    let query = {and: filters};

    let deleteCountRaw       = await this.energyDataRepo.deleteAll(query);
    let deleteCountProcessed = await this.energyDataProcessedRepo.deleteAll(query);

    return deleteCountProcessed;
  }

  @del('/energyData')
  @authenticate(SecurityTypes.admin)
  async deleteAllEnergyData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.dateTime('from', {required:false}) from: Date,
    @param.query.dateTime('until', {required:false}) until: Date,
  ) : Promise<Count> {
    let filters : any[] = [];
    if (from)  { filters.push({timestamp:{gte: from}})  }
    if (until) { filters.push({timestamp:{lte: until}}) }
    let query = {and: filters};

    let deleteCountRaw       = await this.energyDataRepo.deleteAll(query);
    let deleteCountProcessed = await this.energyDataProcessedRepo.deleteAll(query);

    return deleteCountProcessed;
  }



}
