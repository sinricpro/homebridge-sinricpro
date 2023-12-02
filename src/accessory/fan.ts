import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Fan
 */
export class SinricProFan extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private fanState = {
    on: false,
    rotationSpeed: 100,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.FAN_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding Fan', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Fan)
      ?? this.accessory.addService(this.platform.Service.Fan);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.fanState.on = ('ON' === accessory.context.device.powerState?.toUpperCase());

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    // this.service.getCharacteristic(this.platform.Characteristic.Active)
    //       .onGet(this.getActive.bind(this))
    //       .onSet(this.setActive.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onGet(this.getRotationSpeed.bind(this))
      .onSet(this.setRotationSpeed.bind(this));
  }

  /**
   * Updates the service with the new value.
   * @param action - setPowerState
   * @param value  - The message containing the new value. eg: {"state":"Off"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.fanState.on = 'ON' === value.state.toUpperCase();
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.fanState.on);
    } else if(action === ActionConstants.SET_RANGE_VALUE) {
      this.fanState.rotationSpeed = value.rangeValue;
      this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed).updateValue(this.fanState.rotationSpeed);
    }
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.fanState.on);
    return this.fanState.on;
  }

  getRotationSpeed(): CharacteristicValue {
    this.platform.log.info('getRotationSpeed:', this.accessory.displayName, 'is currently', this.fanState.rotationSpeed);
    return this.fanState.rotationSpeed;
  }

  setRotationSpeed(value: CharacteristicValue) {
    super.setRangeValue(value);
  }
}