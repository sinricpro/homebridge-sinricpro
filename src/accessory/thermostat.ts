/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Thermostat
 */
export class SinricProThermostat extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private thermostatStates = {
    on: false,
    currentTemperature: 0,
    targetTemperature : 0,
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

    this.platform.log.debug('Adding Thermostat', this.accessory.displayName, accessory.context.device);

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

  }

  /**
   * Updates the service with the new value.
   * @param action - setPowerState
   * @param value  - The message containing the new value. eg: {"state":"Off"}
   */
  public updateState(action: string, value: any): void {
    if(action === ActionConstants.SET_POWER_STATE) {
      this.thermostatStates.on = 'ON' === value.state.toUpperCase();
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.thermostatStates.on);
    }
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
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.thermostatStates.on);
    return this.thermostatStates.on;
  }
}