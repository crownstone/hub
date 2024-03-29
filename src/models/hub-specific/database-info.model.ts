import { Entity, model, property } from '@loopback/repository';

@model()
export class DatabaseInfo extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true})
  version: number;

}
