import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Contact Sensor
 */
export class SinricProContactSensor extends AccessoryController implements SinricProAccessory {
  private readonly service: Service;

  private states = {
    contactState: this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.CONTACT_SENSOR_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding SinricProContactSensor', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.ContactSensor)
      ?? this.accessory.addService(this.platform.Service.ContactSensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, `${accessory.context.device.name} Contact Sensor`);

    // register handlers for Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.MotionDetected)
      .onGet(this.getContactState.bind(this));
  }

  getContactState(): CharacteristicValue {
    this.platform.log.debug('getContactState:', this.accessory.displayName, '=', this.states.contactState);
    return this.states.contactState;
  }

  /**
   * Updates the service with the new value.
   * @param action - setContactState
   * @param value  -  "state": "open" or  "state": "closed"
   */
  updateState(action: string, value: any): void {
    this.platform.log.debug('Updating ContactSensor state:', this.accessory.displayName);

    if(action === ActionConstants.SET_CONTACT_STATE) {
      this.states.contactState = value.state === 'open' ?
        this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED
        : this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
      this.service.updateCharacteristic(this.platform.Characteristic.ContactSensorState, this.states.contactState);
    }
  }
}