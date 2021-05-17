import {CrownstoneUart, UartTopics} from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
import {eventBus} from '../HubEventBus';
import {CONFIG} from '../../config';

import {Logger} from '../../Logger';
import {topics, WebhookInternalTopics} from '../topics';
import {UartHubDataCommunication} from './UartHubDataCommunication';
import {Dbs} from '../data/DbReference';
import {CrownstoneUtil} from '../CrownstoneUtil';
import {CrownstoneCloud} from 'crownstone-cloud';
import {HubStatusManager} from './HubStatusManager';
import {FilterSycingCommunicationInterface, FilterSyncer} from 'crownstone-core/dist/util/FilterSyncer';
import {increaseMasterVersion, ResultValue} from 'crownstone-core';
import {FilterManager} from '../filters/FilterManager';
const log = Logger(__filename);


export class Uart implements UartInterface {
  connection      : CrownstoneUart;
  queue           : PromiseManager;
  hubDataHandler  : UartHubDataCommunication;
  ready           : boolean = false
  cloud           : CrownstoneCloud;

  refreshingKey   = false
  timeLastRefreshed = 0;

  _initialized: Promise<void>

  constructor(cloud: CrownstoneCloud) {
    this.queue = new PromiseManager();
    this.cloud = cloud;

    this.connection  = new CrownstoneUart();
    this.connection.hub.setMode("HUB");

    this.hubDataHandler = new UartHubDataCommunication(this.connection);
    this.forwardEvents();
  }

  forwardEvents() {
    // generate a list of topics that can be remapped from connection to lib.
    let eventsToForward = [
      {uartTopic: UartTopics.MeshServiceData,                 moduleTopic: topics.MESH_SERVICE_DATA},
      {uartTopic: UartTopics.AssetMacReport,                  moduleTopic: WebhookInternalTopics.__ASSET_REPORT},
      {uartTopic: UartTopics.NearstCrownstoneTrackingUpdate,  moduleTopic: WebhookInternalTopics.__ASSET_TRACKING_UPDATE},
      {uartTopic: UartTopics.NearstCrownstoneTrackingTimeout, moduleTopic: WebhookInternalTopics.__ASSET_TRACKING_UPDATE_TIMEOUT},
    ];


    // forward all required events to the module eventbus.
    eventsToForward.forEach((event) => {
      let moduleEvent = event.moduleTopic;
      if (!event.moduleTopic) {
        moduleEvent = event.uartTopic;
      }

      this.connection.on(event.uartTopic, (data) => { eventBus.emit(moduleEvent, data); })
    });

    this.connection.on(UartTopics.HubDataReceived, (data: {payload: Buffer, wasEncrypted: boolean}) => { this.hubDataHandler.handleIncomingHubData(data) })
    this.connection.on(UartTopics.KeyRequested,    () => { log.info("Uart is requesting a key");             this.refreshUartEncryption(); });
    this.connection.on(UartTopics.DecryptionFailed,() => { log.info("Uart failed to decrypt. Refresh key."); this.refreshUartEncryption(); });
  }


  async _initialize() {
    try {
      await this.connection.start(CONFIG.uartPort);
      await HubStatusManager.setStatus({
        clientHasBeenSetup: false,
        encryptionRequired: false,
        clientHasInternet: false,
      });
      log.info("Uart is ready");

      this.ready = true;
    }
    catch (err) {
      this.ready = false;
      throw err;
    }
  }

  /**
   * This will directly return a promise, which will be resolved once uart is initialized.
   */
  async initialize() : Promise<void> {
    this._initialized = this._initialize();
    return this._initialized;
  }


  async refreshUartEncryption() {
    try {
      if (this.refreshingKey === true) { return; }
      // throttle the refreshes...
      if (Date.now() - this.timeLastRefreshed < 5000) {
        return;
      }

      this.timeLastRefreshed = Date.now();

      if (!Dbs.hub) { return; }
      if (await Dbs.hub.isSet() === false) { return; }

      this.refreshingKey = true;

      let hub = await Dbs.hub.get();
      if (!hub) { this.refreshingKey = false; return; }

      if (hub.uartKey) {
        this.connection.encryption.setKey(hub.uartKey);
      }

      await CrownstoneUtil.checkLinkedStoneId();

      // this is done regardless since we might require a new key.
      let uartKey;
      try {
        uartKey = await this.cloud.hub().getUartKey();
      }
      catch (err) {
        log.warn("Could not obtain the uart key from the cloud...", err);
        this.refreshingKey = false;
        return;
      }

      hub = await Dbs.hub.get();
      if (uartKey !== hub?.uartKey && hub) {
        hub.uartKey = uartKey;
        await Dbs.hub.save(hub);
      }
      this.connection.encryption.setKey(uartKey);
      this.refreshingKey = false;
    }
    catch (err) {
      this.refreshingKey = false;
      throw err;
    }
  }


  async switchCrownstones(switchPairs : SwitchData[]) {
    if (!this.ready) { throw "NOT_READY"; }

    return this.queue.register(() => {
      log.info("Dispatching switchAction", switchPairs);
      return this.connection.switchCrownstones(switchPairs);
    }, "switchCrownstones from Uart" + JSON.stringify(switchPairs));
  }

  registerTrackedDevice(
    trackingNumber:number,
    locationUID:number,
    profileId:number,
    rssiOffset:number,
    ignoreForPresence:boolean,
    tapToToggleEnabled:boolean,
    deviceToken:number,
    ttlMinutes:number
  ) {
    if (!this.ready) { throw "NOT_READY"; }

    this.queue.register(() => {
      return this.connection.control.registerTrackedDevice(
        trackingNumber,
        locationUID,
        profileId,
        rssiOffset,
        ignoreForPresence,
        tapToToggleEnabled,
        deviceToken,
        ttlMinutes,
      )
    })
  }

  async syncFilters(allowErrorRepair: boolean = true) : Promise<void> {
    log.info("Preparing to sync filters over uart");
    let filterSet  = await Dbs.assetFilterSets.findOne();
    if (!filterSet) { throw "NO_FILTER_SET"; }

    let filtersInSet = await Dbs.assetFilters.find({where: {filterSetId: filterSet.id}});
    let data: FilterSyncingTargetData = {
      masterVersion: filterSet.masterVersion,
      masterCRC: filterSet.masterCRC,
      filters: []
    }
    for (let filter of filtersInSet) {
      data.filters.push({
        idOnCrownstone: filter.idOnCrownstone,
        crc:            parseInt(filter.dataCRC, 16),
        filter:         Buffer.from(filter.data, 'hex')
      })
    }

    let receivedMasterVersion = null;
    let receivedMasterCRC     = null;

    let commandInterface: FilterSycingCommunicationInterface = {
      getSummaries: async () => {
        return this.queue.register(async () => {
          log.info("Getting filter summaries");
          let summaries = await this.connection.control.getFilterSummaries();
          receivedMasterVersion = summaries.masterVersion;
          receivedMasterCRC     = summaries.masterCRC;
          return summaries;
        }, "syncFilters from Uart");
      },
      remove: async (protocol: number, filterId: number) => {
        return this.queue.register(async () => {
          log.info("Removing filter", filterId);
          return this.connection.control.removeFilter(filterId);
        }, "syncFilters from Uart");
      },
      upload: async (protocol: number, filterData: FilterData) => {
        return this.queue.register(async () => {
          log.info("uploading filter");
          return this.connection.control.uploadFilter(filterData.idOnCrownstone, filterData.filter);
        }, "syncFilters from Uart");
      },
      commit: async (protocol: number) => {
        return this.queue.register(async () => {
          log.info("commiting filter changes");
          // @ts-ignore
          return this.connection.control.commitFilterChanges(filterSet.masterVersion, filterSet.masterCRC)
        }, "syncFilters from Uart");
      },
    }

    log.info("Starting to sync filters over uart")
    let syncer = new FilterSyncer(commandInterface, data);
    try {
      await syncer.syncToCrownstone();
    }
    catch (err) {
      switch (err) {
        case "TARGET_HAS_HIGHER_VERSION":
          if (receivedMasterVersion) {
            // set our version one higher than the one on the Crownstone.
            filterSet.masterVersion = receivedMasterVersion + 1;
            await Dbs.assetFilterSets.update(filterSet)
            return this.syncFilters()
          }
          else {
            throw err;
          }
        case "TARGET_HAS_SAME_VERSION_DIFFERENT_CRC":
          // bump our version.
          filterSet.masterVersion = increaseMasterVersion(filterSet.masterVersion);
          await Dbs.assetFilterSets.update(filterSet)
          return this.syncFilters();
        case ResultValue.WRONG_STATE:
        case ResultValue.MISMATCH:
          if (allowErrorRepair) {
            log.error("Error during filterSync", err)
            log.notice("Attempting to repair error...")
            // reconstruct all filters and sets.
            await Dbs.assetFilters.deleteAll();
            await Dbs.assetFilterSets.deleteAll();
            await FilterManager.reconstructFilters();
            await FilterManager.refreshFilterSets(filterSet.masterVersion, false);
            log.notice("Retrying sync...")
            return this.syncFilters(false);
          }
        default:
          throw err;
      }
    }
  }
}