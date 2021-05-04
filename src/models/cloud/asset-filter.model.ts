import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {AddTimestamps}                          from '../bases/timestamp-mixin';
import {BaseEntity}                             from '../bases/base-entity';
import {Asset, filterFormat, filterOutputDescription} from './asset.model';
import {AssetFilterSet} from './asset-filter-set.model';

@model()
export class AssetFilter extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  cloudId: string;

  @property({type: 'number', required: true})
  type: number; // this relates to the metadata type

  @property({type: 'number'})
  idOnCrownstone: number;

  @property({type: 'number'})
  profileId: number;

  @property({required: true})
  inputData: filterFormat

  @property({required: true})
  outputDescription: filterOutputDescription

  @property({type: 'string', required:true})
  data: string // this is the full metaData + filterData byte representation of the filter in hexstring format

  @property({type: 'string', required:true})
  dataCRC: string // hexstring format

  @hasMany(() => Asset, {keyTo: 'filterId'})
  assets: Asset[];

  @belongsTo(() => AssetFilterSet, {name:'filterSet'})
  filterSetId: string;
}
