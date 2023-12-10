/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin (https://github.com/sinricpro/homebridge-sinricpro)
 */

import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { SinricProPlatform } from '../platform';

/* Base class to control devices SinricPro via API */
export class AccessoryController {
  public sinricProDeviceId = '';

  constructor(private readonly _platform: SinricProPlatform,
      private readonly _accessory: PlatformAccessory) {
    this.sinricProDeviceId = _accessory.context.device.id;
  }

  /* Turn on or off a device */
  async setPowerState(value: CharacteristicValue) {
    const newState = value as boolean;
    const powerState = newState === true ? 'On' : 'Off';
    this._platform.log.debug(`[setPowerState()]: Set device:${this.sinricProDeviceId} power state to:${powerState}`);
    this._platform.sinricProApiClient.setPowerState(this.sinricProDeviceId, powerState );
  }

  /* Set device's brightness */
  async setBrightness(value: CharacteristicValue) {
    const brightness = value as number;
    this._platform.sinricProApiClient.setBrightness(this.sinricProDeviceId, brightness);
    this._platform.log.debug(`[setBrightness()]: Set brightness (${this.sinricProDeviceId}) brightness to: ${JSON.stringify(value)}`);
  }

  /* Set device's power level */
  async setPowerLevel(value: CharacteristicValue) {
    const powerLevel = value as number;
    this._platform.sinricProApiClient.setPowerLevel(this.sinricProDeviceId, powerLevel);
    this._platform.log.debug(`[setPowerLevel()]: Set powerLevel (${this.sinricProDeviceId}) to:  ${JSON.stringify(value)}`);
  }

  /* Set device's numeric property */
  async setRangeValue(value: CharacteristicValue) {
    const rangeValue = value as number;
    this._platform.sinricProApiClient.setRangeValue(this.sinricProDeviceId, rangeValue);
    this._platform.log.debug(`[setRangeValue()]: Set (${this.sinricProDeviceId}) range value to:  ${JSON.stringify(value)}`);
  }

  /* Set device's target temperature */
  async targetTemperature(value: CharacteristicValue) {
    const temperature = value as number;
    this._platform.sinricProApiClient.setTargetTemperature(this.sinricProDeviceId, temperature);
    this._platform.log.debug(`[targetTemperature()]: Set targetTemperature (${this.sinricProDeviceId}) to:  ${JSON.stringify(value)}`);
  }

  /* Set device's mode */
  async setMode(mode: string) {
    this._platform.sinricProApiClient.setMode(this.sinricProDeviceId, mode);
    this._platform.log.debug(`[setMode()]: Set mode (${this.sinricProDeviceId}) to: ${mode}`);
  }

  /* Set device's lock state */
  async setLockState(state: string) {
    this._platform.sinricProApiClient.setLockState(this.sinricProDeviceId, state);
    this._platform.log.debug(`[setLockState()]: Set lock state (${this.sinricProDeviceId}) to: ${state}`);
  }

  /* Send door-bell notification */
  async setDoorbellPress() {
    this._platform.sinricProApiClient.setDoorbellPress(this.sinricProDeviceId);
    this._platform.log.debug(`[setDoorbellPress()]: Send doorbell (${this.sinricProDeviceId}) pressed`);
  }

  /* Set thermostat mode */
  async setThermostatMode(value: string) {
    this._platform.sinricProApiClient.setThermostatMode(this.sinricProDeviceId, value);
    this._platform.log.debug(`[setThermostatMode()]: Set thermostat mode (${this.sinricProDeviceId}) to: ${value}`);
  }
}