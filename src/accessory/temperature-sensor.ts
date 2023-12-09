import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Temperature Sensor
 * https://developers.homebridge.io/#/service/TemperatureSensor
 */
export class SinricProTemperatureSensor extends AccessoryController implements SinricProAccessory {
  private readonly temperatureService: Service;
  private readonly humidityService: Service;

  private states = {
    temperature: 0,
    humidity: 0,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.TEMPERATURE_SENSOR_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('[SinricProTemperatureSensor()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.temperatureService = this.accessory.getService(this.platform.Service.TemperatureSensor)
      ?? this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.humidityService = this.accessory.getService(this.platform.Service.HumiditySensor)
      ?? this.accessory.addService(this.platform.Service.HumiditySensor);

    this.temperatureService.setCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.name} Temperature Sensor`);
    this.humidityService.setCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.name} Humidity Sensor`);

    // register handlers for Characteristic
    this.temperatureService
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.humidityService
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getCurrentRelativeHumidity.bind(this));

    this.temperatureService.addLinkedService(this.humidityService);

    // restore present device state.
    this.states.temperature = accessory.context.device.temperature ?? 10;
    this.states.humidity = accessory.context.device.humidity ?? 10;
  }

  getCurrentRelativeHumidity(): CharacteristicValue {
    this.platform.log.debug('getCurrentRelativeHumidity:', this.accessory.displayName, '=', this.states.humidity);
    return this.states.humidity;
  }

  getCurrentTemperature(): CharacteristicValue {
    this.platform.log.debug('getCurrentTemperature:', this.accessory.displayName, '=', this.states.temperature);
    return this.states.temperature;
  }

  /**
   * Updates the service with the new value.
   * @param action - currentTemperature
   * @param value  - The new temperature/humidity value.
   */
  updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.CURRENT_TEMPERATURE) {
      this.states.temperature = value.temperature ?? 0;
      this.states.humidity = value.humidity ?? 0;
      this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature).updateValue(this.states.temperature);
      this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity).updateValue(this.states.humidity);
    }
  }
}