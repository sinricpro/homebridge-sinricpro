import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Motion Sensor
 * https://developers.homebridge.io/#/service/MotionSensor
 */
export class SinricProMotionSensor extends AccessoryController implements SinricProAccessory {
  private readonly service: Service;

  private states = {
    motionDetected: 0,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.MOTION_SENSOR_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('[SinricProMotionSensor()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.MotionSensor)
      ?? this.accessory.addService(this.platform.Service.MotionSensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.name} Motion Sensor`);

    // register handlers for Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.MotionDetected)
      .onGet(this.getMotionDetected.bind(this));

    // restore present device state.
    this.states.motionDetected = (accessory.context.device.lastMotionState === 'detected' ? 1 : 0);
  }

  getMotionDetected(): CharacteristicValue {
    this.platform.log.debug('getMotionDetected:', this.accessory.displayName, '=', this.states.motionDetected);
    return this.states.motionDetected;
  }

  /**
   * Updates the service with the new value.
   * @param action - motion
   * @param value  - "state": "detected" or  "state": "notDetected"
   */
  updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.MOTION) {
      this.states.motionDetected = (value.state === 'detected' ? 1 : 0);
    }

    this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, this.states.motionDetected);
  }
}