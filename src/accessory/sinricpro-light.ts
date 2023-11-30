import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './sinricpro-accessory';


/**
 * Sinric Pro - Light
 */
export class SinricProLight implements SinricProAccessory {
  private service: Service;

  private lightStates = {
    On: false,
    brightness: 100,
  };

  public sinricProDeviceId = '';

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.sinricProDeviceId = accessory.context.device.id;
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SinricPro')
      .setCharacteristic(this.platform.Characteristic.Model, 'SinricProLight')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, `SinricProDeviceId-${this.sinricProDeviceId}`);

    this.platform.log.debug('Adding Lightbulb', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb)
      || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.lightStates.brightness = accessory.context.device.brightness;
    this.lightStates.On = (accessory.context.device.powerState == 'On');

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setLightState.bind(this))
      .onGet(this.getLightState.bind(this));

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below
  }

  public updateState(value: any): void {
    // value = {"state":"Off"}
    this.platform.log.debug('Updating Switch state:', this.accessory.displayName);
    this.lightStates.On = value.state == 'On';
    this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.lightStates.On);
  }

  async setBrightness(value: CharacteristicValue) {
    this.lightStates.brightness = value as number;
    // TODO: Call API ..
    this.platform.log.debug('Set Brightness -> ', value);
  }

  async setLightState(value: CharacteristicValue) {
    const newState = value as boolean;
    const powerState = newState === true ? 'On' : 'Off';
    this.platform.sinricProApiClient.setPowerState(this.sinricProDeviceId, powerState );
    this.platform.log.debug(`Set Light (${this.sinricProDeviceId}) to : ${powerState}`);
  }

  getLightState(): CharacteristicValue {
    this.platform.log.debug('Get Light state for:', this.accessory.displayName, this.lightStates);
    return this.lightStates.On;
  }
}