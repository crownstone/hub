import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {EnergyDataProcessed} from '../models';


export class EnergyDataProcessedRepository extends DefaultCrudRepository<EnergyDataProcessed,typeof EnergyDataProcessed.prototype.id> {

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(EnergyDataProcessed, datasource);
    this.datasource.autoupdate()
  }

  async getStoneUIDs() : Promise<number[]> {
    let collection = this.dataSource.connector?.collection("EnergyDataProcessed");
    if (collection) {
      let uids = await collection.distinct('stoneUID');
      return uids;
    }
    else {
      return [];
    }
  }



}

