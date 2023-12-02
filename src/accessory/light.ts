import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants, ActionConstants } from '../constants';

/**
 * Sinric Pro - Light
 */
export class SinricProLight extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private lightStates = {
    on: false,
    brightness: 100,
  };

  public sinricProDeviceId = '';

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.LIGHT_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding Light', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb)
      ?? this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.lightStates.brightness = accessory.context.device.brightness ?? 100;
    this.lightStates.on = ('ON' === accessory.context.device.powerState?.toUpperCase());

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .setProps({
        minValue: 1,
        maxValue: 100,
        validValueRanges: [1, 100],
      })
      .onGet(this.getBrightness.bind(this))
      .onSet(this.setBrightness.bind(this));
  }

  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.lightStates.on = ('ON' === value.state.toUpperCase());
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.lightStates.on);
    } else if(action === ActionConstants.SET_BRIGHTNESS) {
      this.lightStates.brightness =value.brightness;
      this.service.getCharacteristic(this.platform.Characteristic.Brightness).updateValue(this.lightStates.brightness);
    }
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.lightStates.on);
    return this.lightStates.on;
  }

  getBrightness(): CharacteristicValue {
    this.platform.log.debug('getBrightness:', this.accessory.displayName, '=', this.lightStates.brightness);
    return this.lightStates.brightness;
  }
}