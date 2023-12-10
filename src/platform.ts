/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin (https://github.com/sinricpro/homebridge-sinricpro)
 */
import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SinricProApiClient } from './api-client';
import { SinricProSwitch } from './accessory/switch';
import { DeviceTypeConstants } from './constants';
import { SinricProSseClient } from './sse-client';
import { SinricProAccessory } from './accessory/accessory';
import { SinricProLight } from './accessory/light';
import { SinricProDimmableSwitch } from './accessory/dimmable-switch';
import { SinricProDoorbell } from './accessory/doorbell';
import { SinricProTemperatureSensor } from './accessory/temperature-sensor';
import { SinricProFan } from './accessory/fan';
import { SinricProMotionSensor } from './accessory/motion-sensor';
import { SinricProContactSensor } from './accessory/contact-sensor';
import { SinricProThermostat } from './accessory/thermostat';
import { SinricProTV } from './accessory/tv';
import { SinricProLock } from './accessory/lock';
import { SinricProGarageDoor } from './accessory/garage-door';
import { SinricProBlind } from './accessory/blind';
import { SinricProWindowACUnit } from './accessory/window-ac-unit';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SinricProPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public sinricProApiClient!: SinricProApiClient;
  public sinricProSseClient!: SinricProSseClient;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  private sinricproDevices: SinricProAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {

    if(config.token === null) {
      this.log.error('API Token is empty. Cannot continue!');
      return;
    }

    this.sinricProApiClient = new SinricProApiClient(config.token, log);
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      this.didFinishLaunching();
    },
    );
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  async didFinishLaunching() {
    this.log.info('[didFinishLaunching()]: authenticate..!');
    const authenticated = await this.sinricProApiClient.authenticate();

    if(authenticated) {
      this.log.info('[didFinishLaunching()]: init SSE Client..');
      this.sinricProSseClient = new SinricProSseClient(this.log, this.sinricProApiClient.authToken);
      // listen to device state changes
      this.sinricProSseClient.onDeviceStateChange = (deviceId: string, action: string, value: any) => {
        this.sinricproDevices.filter(spd => spd.sinricProDeviceId === deviceId).map((device) => {
          this.log.info('[onDeviceStateChange()]: Update device id: %s with %s', device.sinricProDeviceId, value);
          device.updateState(action, value);
        });
      };
      this.sinricProSseClient.listen();
    }

    this.log.info('[didFinishLaunching()]: start device discovery..!');

    const devices = await this.sinricProApiClient.getDevices() || [];

    for (const device of devices) {
      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(device.id.toString());

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('[didFinishLaunching()]: Restoring existing accessory from cache:', existingAccessory.displayName);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        existingAccessory.context.device = device;
        this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        // new CrestronHomePlatformAccessory(this, existingAccessory);
        this.createSinricProAccessory(existingAccessory);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // the accessory does not yet exist, so we need to create it
        // create a new accessory
        const accessory = new this.api.platformAccessory(device.name, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        // new CrestronHomePlatformAccessory(this, accessory);
        if(this.createSinricProAccessory(accessory)){
          // link the accessory to your platform
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          this.accessories.push(accessory);
        }
      }
    }
  }

  createSinricProAccessory(accessory: PlatformAccessory): boolean {
    const deviceTypeCode = accessory.context.device.deviceType.code;

    this.log.info('[createSinricProAccessory()]: Adding new accessory:', accessory.displayName);

    switch (deviceTypeCode) {
      case DeviceTypeConstants.SWITCH:
        this.sinricproDevices.push(new SinricProSwitch(this, accessory));
        break;
      case DeviceTypeConstants.LIGHT:
        this.sinricproDevices.push(new SinricProLight(this, accessory));
        break;
      case DeviceTypeConstants.DIMMABLE_SWITCH:
        this.sinricproDevices.push(new SinricProDimmableSwitch(this, accessory));
        break;
      case DeviceTypeConstants.DOORBELL:
        this.sinricproDevices.push(new SinricProDoorbell(this, accessory));
        break;
      case DeviceTypeConstants.TEMPERATURE_SENSOR:
        this.sinricproDevices.push(new SinricProTemperatureSensor(this, accessory));
        break;
      case DeviceTypeConstants.FAN:
        this.sinricproDevices.push(new SinricProFan(this, accessory));
        break;
      case DeviceTypeConstants.MOTION_SENSOR:
        this.sinricproDevices.push(new SinricProMotionSensor(this, accessory));
        break;
      case DeviceTypeConstants.CONTACT_SENSOR:
        this.sinricproDevices.push(new SinricProContactSensor(this, accessory));
        break;
      case DeviceTypeConstants.THERMOSTAT:
        this.sinricproDevices.push(new SinricProThermostat(this, accessory));
        break;
      case DeviceTypeConstants.TV:
        this.sinricproDevices.push(new SinricProTV(this, accessory));
        break;
      case DeviceTypeConstants.SMARTLOCK:
        this.sinricproDevices.push(new SinricProLock(this, accessory));
        break;
      case DeviceTypeConstants.GARAGE_DOOR:
        this.sinricproDevices.push(new SinricProGarageDoor(this, accessory));
        break;
      case DeviceTypeConstants.BLIND:
        this.sinricproDevices.push(new SinricProBlind(this, accessory));
        break;
      case DeviceTypeConstants.AC_UNIT:
        this.sinricproDevices.push(new SinricProWindowACUnit(this, accessory));
        break;
      default:
        this.log.warn('[createSinricProAccessory()]: Unsupported accessory type:', accessory.context.device.type);
        break;
    }

    return true;

  }
}