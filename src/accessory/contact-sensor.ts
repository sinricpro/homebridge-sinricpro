/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin (https://github.com/sinricpro/homebridge-sinricpro)
 */

import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ActionConstants, ModelConstants } from '../constants';

/**
 * Sinric Pro - Contact Sensor
 * https://developers.homebridge.io/#/service/ContactSensor
 */
export class SinricProContactSensor extends AccessoryController implements SinricProAccessory {
  private readonly service: Service;

  private states = {
    contactState: this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.CONTACT_SENSOR_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('[SinricProContactSensor()]:', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.ContactSensor)
      ?? this.accessory.addService(this.platform.Service.ContactSensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.name} Contact Sensor`);

    // register handlers for Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .onGet(this.getContactState.bind(this));

    // restore present device state
    this.states.contactState = this.toContactSensorState(accessory.context.device.contactState);
    this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState).updateValue(this.states.contactState);
  }

  /**
   * Convert SinricPro contact state to Homebridge contact state
   */
  toContactSensorState(contactState: string) {
    return contactState !== 'open' ?
      this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED
      : this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
  }

  getContactState(): CharacteristicValue {
    this.platform.log.debug('getContactState:', this.accessory.displayName, '=', this.states.contactState);
    return this.states.contactState;
  }

  /**
   * Updates the service with the new value.
   * @param action - setContactState
   * @param value  -  "state": "open" or  "state": "closed"
   */
  updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.SET_CONTACT_STATE) {
      this.states.contactState = this.toContactSensorState(value.state);
      this.service.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.states.contactState);
    }
  }
}