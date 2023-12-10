/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin (https://github.com/sinricpro/homebridge-sinricpro)
 */

/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants, ActionConstants } from '../constants';

/**
 * Sinric Pro - WindowACUnit
 * https://developers.homebridge.io/#/service/Thermostat
 */
export class SinricProWindowACUnit extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private thermostatStates = {
    on: false,
    currentTemperature: 10,
    targetTemperature : 10,
    targetTemperatureDisplayUnit: this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS,
    currentHeatingCoolingState: this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
    targetHeatingCoolingState: this.platform.Characteristic.TargetHeatingCoolingState.AUTO,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.THERMOSTAT_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('[SinricProThermostat()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Thermostat)
      ?? this.accessory.addService(this.platform.Service.Thermostat);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .onGet(this.onGetTargetTemperature.bind(this))
      .onSet(this.onSetTargetTemperature.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(this.getTemperatureDisplayUnits.bind(this))
      .onSet(this.setTemperatureDisplayUnits.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentHeatingCoolingState.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onGet(this.getTargetHeatingCoolingState.bind(this))
      .onSet(this.setTargetHeatingCoolingState.bind(this));

    // restore present device state.
    this.thermostatStates.currentTemperature = accessory.context.device.temperature ?? 10;
    this.thermostatStates.targetTemperature = accessory.context.device.targetTemperature ?? 10;
    this.thermostatStates.currentHeatingCoolingState = this.toCurrentHeatingCoolingState(accessory.context.device.thermostatMode);
    this.thermostatStates.targetHeatingCoolingState = this.toTargetHeatingCoolingState(accessory.context.device.thermostatMode);
  }

  /**
   * Updates the service with the new value.
   * @param action - setPowerState, targetTemperature, setThermostatMode
   * @param value  - {"state":"Off"}, { temperature: 17.5 }, { thermostatMode: 'HEAT' }
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.thermostatStates.on = 'ON' === value.state.toUpperCase();
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.thermostatStates.on);
    } else if(action === ActionConstants.TARGET_TEMPERATURE) {
      this.thermostatStates.targetTemperature = value.temperature;
      this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature).updateValue(this.thermostatStates.targetTemperature);
    } else if(action === ActionConstants.SET_THERMOSTAT_MODE) {
      this.thermostatStates.currentHeatingCoolingState = this.toCurrentHeatingCoolingState(value.thermostatMode);
      this.thermostatStates.targetHeatingCoolingState = this.toTargetHeatingCoolingState(value.thermostatMode);
      this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState).updateValue(this.thermostatStates.currentHeatingCoolingState);
      this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState).updateValue(this.thermostatStates.targetHeatingCoolingState);
    }
  }

  toTargetHeatingCoolingState(thermostatMode: string) {
    let state = this.platform.Characteristic.TargetHeatingCoolingState.COOL;

    if('OFF' === thermostatMode) {
      state = this.platform.Characteristic.TargetHeatingCoolingState.OFF;
    } else if('HEAT' === thermostatMode) {
      state = this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
    } else if('COOL' === thermostatMode) {
      state = this.platform.Characteristic.TargetHeatingCoolingState.COOL;
    }

    return state;
  }

  toCurrentHeatingCoolingState(thermostatMode: string) {
    let state = this.platform.Characteristic.CurrentHeatingCoolingState.COOL;

    if('OFF' === thermostatMode) {
      state = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    } else if('HEAT' === thermostatMode) {
      state = this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
    } else if('COOL' === thermostatMode) {
      state = this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
    }

    return state;
  }

  getCurrentTemperature(): CharacteristicValue {
    this.platform.log.debug('getCurrentTemperature:', this.accessory.displayName, '=', this.thermostatStates.currentTemperature);
    return this.thermostatStates.currentTemperature;
  }

  onGetTargetTemperature(): CharacteristicValue {
    this.platform.log.debug('onGetTargetTemperature:', this.accessory.displayName, '=', this.thermostatStates.targetTemperature);
    return this.thermostatStates.targetTemperature;
  }

  onSetTargetTemperature(value: CharacteristicValue) {
    this.platform.log.debug('onSetTargetTemperature:', this.accessory.displayName, 'to', value);
    this.thermostatStates.targetTemperature = value as number;
    super.targetTemperature(value);
  }

  getTemperatureDisplayUnits(): CharacteristicValue {
    this.platform.log.debug('getTemperatureDisplayUnits:', this.accessory.displayName, '=', this.thermostatStates.targetTemperatureDisplayUnit);
    return this.thermostatStates.targetTemperatureDisplayUnit;
  }

  setTemperatureDisplayUnits(value: CharacteristicValue) {
    this.platform.log.debug('setTemperatureDisplayUnits:', this.accessory.displayName, 'to', value);
    this.thermostatStates.targetTemperatureDisplayUnit = value as number;
  }

  getCurrentHeatingCoolingState(): CharacteristicValue {
    this.platform.log.debug('getCurrentHeatingCoolingState:', this.accessory.displayName, '=', this.thermostatStates.currentHeatingCoolingState);
    return this.thermostatStates.currentHeatingCoolingState;
  }

  getTargetHeatingCoolingState(): CharacteristicValue {
    this.platform.log.debug('getTargetHeatingCoolingState:', this.accessory.displayName, '=', this.thermostatStates.targetHeatingCoolingState);
    return this.thermostatStates.targetHeatingCoolingState;
  }

  setTargetHeatingCoolingState(value: CharacteristicValue) {
    this.platform.log.debug('setTargetHeatingCoolingState:', this.accessory.displayName, 'to', value);
    this.thermostatStates.targetHeatingCoolingState = value as number;
    let thermostatMode = 'AUTO';

    if(this.platform.Characteristic.TargetHeatingCoolingState.OFF === this.thermostatStates.targetHeatingCoolingState) {
      thermostatMode = 'OFF';
    } else if(this.platform.Characteristic.TargetHeatingCoolingState.HEAT === this.thermostatStates.targetHeatingCoolingState) {
      thermostatMode = 'HEAT';
    } else if(this.platform.Characteristic.TargetHeatingCoolingState.COOL === this.thermostatStates.targetHeatingCoolingState) {
      thermostatMode = 'COOL';
    } else if(this.platform.Characteristic.TargetHeatingCoolingState.AUTO === this.thermostatStates.targetHeatingCoolingState) {
      thermostatMode = 'AUTO';
    }

    super.setThermostatMode(thermostatMode);

  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.thermostatStates.on);
    return this.thermostatStates.on;
  }
}