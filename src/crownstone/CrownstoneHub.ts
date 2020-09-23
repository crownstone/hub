import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';
import {DbRef} from './Data/DbReference';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
import {CloudCommandHandler} from './Cloud/CloudCommandHandler';
import {Timekeeper} from './Actions/Timekeeper';
import {Logger} from '../Logger';
const log = Logger(__filename);


export class CrownstoneHubClass implements CrownstoneHub {
  uart        : Uart;
  cloud       : CloudManager;
  mesh        : MeshMonitor;
  timeKeeper  : Timekeeper;

  launched = false

  constructor() {
    this.cloud = new CloudManager()
    this.uart  = new Uart();
    this.mesh  = new MeshMonitor(this);


    this.timeKeeper = new Timekeeper(this);
    CloudCommandHandler.loadManager(this.cloud);
  }



  async initialize() {
    log.info("Launching Modules");
    if (this.launched === false) {
      // execute modules
      await this.uart.initialize();
      log.info("Uart initialized")
      await this.cloud.initialize();
      log.info("Cloud initialized")

      this.mesh.init()
      this.timeKeeper.init()


      this.launched = true;
    }
  }

  async cleanupAndDestroy() {
    await this.mesh.cleanup();

    await this.timeKeeper.stop();

    await CrownstoneHub.cloud.cleanup();

    await DbRef.hub.deleteAll();
    await DbRef.user.deleteAll();
    await DbRef.power.deleteAll();
    await DbRef.energy.deleteAll();
    await DbRef.energyProcessed.deleteAll();
  }

}


export const CrownstoneHub = new CrownstoneHubClass()