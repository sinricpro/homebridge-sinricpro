import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Blind
 */
export class SinricProBlind extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private states = {
    currentPosition: 0,
    targetPosition: 0,
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

    this.platform.log.debug('Adding Blind', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.WindowCovering)
      ?? this.accessory.addService(this.platform.Service.WindowCovering);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the characteristic
    this.service.getCharacteristic(this.platform.Characteristic.PositionState);
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onGet(this.getCurrentPostion.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onSet(this.setTargetPostion.bind(this));
  }

  /**
   * Updates the service with the new value.
   * @param action - setRangeValue
   * @param value  - {"rangeValue":100}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if (action === ActionConstants.SET_RANGE_VALUE) {
      this.states.currentPosition = value.rangeValue;
      this.accessory.context.device.rangeValue = value.rangeValue;
    }
  }

  async setTargetPostion(value: CharacteristicValue) {
    const tmpValue = value as number;
    if (this.states.targetPosition !== tmpValue) {
      this.setRangeValue(value);
    }
  }

  getCurrentPostion(): CharacteristicValue {
    const Position = this.states.currentPosition;
    return Position;
  }

}