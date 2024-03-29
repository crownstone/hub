import {CONFIG} from '../config';
import fs from "fs";
import {Util} from './Util';
import path from 'path';
import {Logger} from '../Logger';
import {eventBus} from '../crownstone/HubEventBus';
import {topics} from '../crownstone/topics';

const log = Logger(__filename);


const defaultConfig : HubConfig = {
  useDevControllers: false,
  useLogControllers: false,

  logging: {},
  developerOptions: {
    actOnSwitchCommands: true
  }
}

const defaultPortConfig : HubPortConfig = {
  httpPort: 80,
  enableHttp: true,
  httpsPort: 443,
}

function checkObject(candidate : any, example : any) {
  let keys = Object.keys(example);
  for (let i = 0; i < keys.length; i++) {
    if (typeof example[keys[i]] === 'object' ) {
      if (candidate[keys[i]] === undefined || typeof candidate[keys[i]] !== 'object') {
        // @ts-ignore
        candidate[keys[i]] = {...example[keys[i]]};
      }
      else {
        checkObject(candidate[keys[i]], example[keys[i]]);
      }
    }
    else if (candidate[keys[i]] === undefined) {
      // @ts-ignore
      candidate[keys[i]] = example[keys[i]];
    }
  }
}

export function getHubConfig() : HubConfig {
  let configPath = getConfigPath();
  let dataObject: any = {};
  if (fs.existsSync(configPath)) {
    let data = fs.readFileSync(configPath, 'utf-8');
    if (data && typeof data === 'string') {
      dataObject = JSON.parse(data);
    }
  }
  checkObject(dataObject, defaultConfig);
  return dataObject;
}

export function getPortConfig() : HubPortConfig {
  let configPath = getPortConfigPath();
  let dataObject: any = {};
  if (fs.existsSync(configPath)) {
    let data = fs.readFileSync(configPath, 'utf-8');
    if (data && typeof data === 'string') {
      dataObject = JSON.parse(data);
    }
  }
  return dataObject;
}

export function getHttpsPort() : number {
  let portConfig = getPortConfig();
  return Number(portConfig.httpsPort ?? CONFIG.httpsPort ?? 443);
}
export function getHttpPort() : number {
  let portConfig = getPortConfig();
  return Number(portConfig.httpPort ?? CONFIG.httpPort ?? 80);
}

function getConfigPath() {
  return path.join(prepareConfigPath(), 'hub_config.json');
}

function getPortConfigPath() {
  return path.join(prepareConfigPath(), 'port_config.json');
}

function prepareConfigPath() {
  let configPath = Util.stripTrailingSlash(CONFIG.configPath || (Util.stripTrailingSlash(__dirname) + "/config"));

  let pathExists = fs.existsSync(configPath)
  if (!pathExists) {
    fs.mkdirSync(configPath);
  }

  return configPath;
}

export function storeHubConfig(config : HubConfig) {
  let configPath = getConfigPath();
  let str = JSON.stringify(config);
  fs.writeFileSync(configPath, str);
  eventBus.emit(topics.HUB_CONFIG_UPDATED)
}