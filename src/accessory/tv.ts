import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ActionConstants, ModelConstants } from '../constants';

/**
 * Sinric Pro - TV
 * https://developers.homebridge.io/#/service/Television
 */
export class SinricProTV extends AccessoryController implements SinricProAccessory {
  private tvService: Service;
  private tvStates = {
    on: false,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.TV_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('[SinricProTV()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.tvService = this.accessory.getService(this.platform.Service.Television)
      ?? this.accessory.addService(this.platform.Service.Television);
    this.tvService.setPrimaryService(true);

    // register handlers for the characteristic
    this.tvService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    // restore present device state.
    this.tvStates.on = ('ON' === accessory.context.device.powerState?.toUpperCase());
  }

  /**
   * Updates the service with the new value.
   * @param action - setPowerState
   * @param value  - The message containing the new value. eg: {"state":"Off"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.tvStates.on = 'ON' === value.state.toUpperCase();
      this.tvService.getCharacteristic(this.platform.Characteristic.On).updateValue(this.tvStates.on);
    }
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('[getPowerState()]: device:', this.accessory.displayName, ', on=', this.tvStates.on);
    return this.tvStates.on;
  }
}