import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {CrownstoneSequence} from './sequence';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {AuthorizationComponent} from '@loopback/authorization';
import {CsTokenStrategy} from './security/authentication-strategies/csToken-strategy';
import {UserService} from './services';
import {getHttpsPort, getHubConfig} from './util/ConfigUtil';
import {LogController} from './controllers/logging/log.controller';
import {CsAdminTokenStrategy} from './security/authentication-strategies/csAdminToken-strategy';
import {Logger} from './Logger';
import {DevController} from './controllers/development/dev.controller';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
const pkg: PackageInfo = require('../package.json');
const log = Logger(__filename);

export let BOOT_TIME = Date.now();

export class CrownstoneHubApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {

  constructor(options: ApplicationConfig = {}) {
    let executionPath = __dirname;
    if (options.customPath !== undefined) { executionPath = options.customPath; }

    let customPort = getHttpsPort();

    if (options.rest && options.rest.port !== undefined) {
      customPort = options.rest.port;
    }

    super({...options, rest: { ...options.rest, port: customPort }})

    this.api({
      openapi: '3.0.0',
      info: {title: pkg.name, version: pkg.version},
      paths: {},
      components: {securitySchemes: {sphereAuthorizationToken: {
        type: 'apiKey',
        in: 'header',
        name:'access_token'
      }}},
      servers:  [{url: '/api'}],
      security: [{sphereAuthorizationToken: []}]
    });


    this.setUpBindings();
    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent);

    // authentication
    registerAuthenticationStrategy(this, CsTokenStrategy);
    registerAuthenticationStrategy(this, CsAdminTokenStrategy);

    // Set up the custom sequence
    this.sequence(CrownstoneSequence);

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({ path: '/explorer' });
    this.component(RestExplorerComponent);

    this.projectRoot = executionPath;

    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.ts','.controller.js'],
        nested: false,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.ts','.repository.js'],
        nested: true,
      },
      datasources: {
        dirs: ['datasources'],
        extensions: ['.datasource.ts','.datasource.js'],
        nested: true,
      },
      services: {
        dirs: ['services'],
        extensions: ['.service.ts','.service.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    this.bind("UserService").toClass(UserService);
  }


}


export function updateControllersBasedOnConfig(app : CrownstoneHubApplication) {
  let hubConfig = getHubConfig();
  if (hubConfig.useLogControllers) {
    app.controller(LogController)
  }
  if (hubConfig.useDevControllers) {
    app.controller(DevController)
  }
}

export function updateLoggingBasedOnConfig() {
  let hubConfig = getHubConfig();
  let individualFileLoggingEnabled = false;

  let loggers = log.config.getLoggerIds()
  let overrideLoggerIds = Object.keys(hubConfig.logging);

  // check if file logging is required for an individual logger.
  overrideLoggerIds.forEach((loggerId) => {
    if (loggers.indexOf(loggerId) !== -1) {

      if (hubConfig.logging[loggerId].file !== 'none') {
        individualFileLoggingEnabled = true;
      }
    }
  });

  if (individualFileLoggingEnabled) {
    log.config.setFileLogging(true);
  }

  overrideLoggerIds.forEach((loggerId) => {
    if (loggers.indexOf(loggerId) !== -1) {
      let transports = log.config.getTransportForLogger(loggerId);
      if (transports) {
        transports.console.level = hubConfig.logging[loggerId].console;
        if (transports.file) {
          transports.file.level = hubConfig.logging[loggerId].file;
        }
      }
    }
  });
}