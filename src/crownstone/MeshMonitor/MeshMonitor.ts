import { PowerMonitor }    from './PowerMonitor';
import { EnergyMonitor }   from './EnergyMonitor';
import { TopologyMonitor } from './TopologyMonitor';
import { SwitchMonitor }   from './SwitchMonitor';
const LOG = require('debug-level')('crownstone-hub-mesh-monitor')

export class MeshMonitor {
  eventsRegistered = false;

  power:    PowerMonitor;
  energy:   EnergyMonitor;
  switch:   SwitchMonitor;
  topology: TopologyMonitor;


  constructor() {
    this.power    = new PowerMonitor();
    this.energy   = new EnergyMonitor();
    this.switch   = new SwitchMonitor();
    this.topology = new TopologyMonitor();

    this.setupEvents();
  }


  setupEvents() {
    if (this.eventsRegistered === false) {
      // eventBus.on(topics.MESH_SERVICE_DATA, (data: ServiceDataJson) => { this.gather(data); });
      this.eventsRegistered = true;
    }
  }

  gather(data: ServiceDataJson) {
    let crownstoneUid = data.crownstoneId; // the id in the advertisement is the short-uid
    LOG.debug("Received data from", crownstoneUid)
    this.power.collect(crownstoneUid, data.powerUsageReal, data.powerFactor);
    this.energy.collect(crownstoneUid, data.accumulatedEnergy);
    this.switch.collect(crownstoneUid, data.switchState);
    this.topology.collect(crownstoneUid);
  }
} 