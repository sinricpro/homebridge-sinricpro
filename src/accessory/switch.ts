import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Switch
 */
export class SinricProSwitch extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private switchStates = {
    on: false,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.SWITCH_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding Switch', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Switch)
      ?? this.accessory.addService(this.platform.Service.Switch);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.switchStates.on = ('ON' === accessory.context.device.powerState?.toUpperCase());

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));
  }

  /**
   * Updates the service with the new value.
   * @param action - setPowerState
   * @param value  - The message containing the new value. eg: {"state":"Off"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.switchStates.on = 'ON' === value.state.toUpperCase();
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.switchStates.on);
    }
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.switchStates.on);
    return this.switchStates.on;
  }
}