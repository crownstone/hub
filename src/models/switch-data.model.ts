import { Entity, model, property } from '@loopback/repository';

@model()
export class SwitchData extends Entity {
  constructor(data?: Partial<SwitchData>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  stoneUID: string;

  @property({type: 'number'})
  switchState: number;

  @property({type: 'date'})
  timestamp: Date
}
