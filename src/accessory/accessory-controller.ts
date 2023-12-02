import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { SinricProPlatform } from '../platform';

export class AccessoryController {
  public sinricProDeviceId = '';

  constructor(private readonly _platform: SinricProPlatform,
      private readonly _accessory: PlatformAccessory) {
    this.sinricProDeviceId = _accessory.context.device.id;
  }

  async setPowerState(value: CharacteristicValue) {
    const newState = value as boolean;
    const powerState = newState === true ? 'On' : 'Off';
    this._platform.sinricProApiClient.setPowerState(this.sinricProDeviceId, powerState );
    this._platform.log.debug(`Set powerstate (${this.sinricProDeviceId}) to: ${powerState}`);
  }

  async setBrightness(value: CharacteristicValue) {
    const brightness = value as number;
    this._platform.sinricProApiClient.setBrightness(this.sinricProDeviceId, brightness);
    this._platform.log.debug(`Set brightness (${this.sinricProDeviceId}) brightness to: ${value}`);
  }

  async setRangeValue(value: CharacteristicValue) {
    const rangeValue = value as number;
    this._platform.sinricProApiClient.setRangeValue(this.sinricProDeviceId, rangeValue);
    this._platform.log.debug(`Set (${this.sinricProDeviceId}) range value to: ${value}`);
  }

  async targetTemperature(value: CharacteristicValue) {
    const temperature = value as number;
    this._platform.sinricProApiClient.setTargetTemperature(this.sinricProDeviceId, temperature);
    this._platform.log.debug(`Set targetTemperature (${this.sinricProDeviceId}) to: ${value}`);
  }

  async setMode(mode: string) {
    this._platform.sinricProApiClient.setMode(this.sinricProDeviceId, mode);
    this._platform.log.debug(`Set mode (${this.sinricProDeviceId}) to: ${mode}`);
  }

  async setLockState(state: string) {
    this._platform.sinricProApiClient.setLockState(this.sinricProDeviceId, state);
    this._platform.log.debug(`Set lock state (${this.sinricProDeviceId}) to: ${state}`);
  }

  async setDoorbellPress() {
    this._platform.sinricProApiClient.setDoorbellPress(this.sinricProDeviceId);
    this._platform.log.debug(`Send doorbell (${this.sinricProDeviceId}) pressed`);
  }


}