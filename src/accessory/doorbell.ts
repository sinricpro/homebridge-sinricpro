import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Doorbell
 */
export class SinricProDoorbell extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private states = {
    switchEvent: 0,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.DOORBELL_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding Doorbell', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Doorbell)
      ?? this.accessory.addService(this.platform.Service.Doorbell);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for characteristics
    this.service
      .getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
      .onSet(() => this.setProgrammableSwitchEvent());
  }

  updateState(action: string, value: any): void {
    throw new Error('Method not implemented.');
  }

  setProgrammableSwitchEvent() {
    this.setDoorbellPress();
  }
}