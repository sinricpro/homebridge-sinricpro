import { Service, PlatformAccessory } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';

/**
 * Sinric Pro - Doorbell
 * https://developers.homebridge.io/#/service/Doorbell
 *
 * AppleHome app shows device is not supported.
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

    this.platform.log.debug('[SinricProDoorbell()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Doorbell)
      ?? this.accessory.addService(this.platform.Service.Doorbell);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    this.service.setPrimaryService(true);

    // register handlers for characteristics
    this.service
      .getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
      .onGet(this.handleProgrammableSwitchEventGet.bind(this));
  }

  updateState(action: string, value: any): void {
    this.platform.log.error('[updateState()]: Method not implemented.!');
    // this.service?.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
    //     ?.updateValue(this.State.ProgrammableSwitchEvent);
  }

  handleProgrammableSwitchEventGet() {
    //this.setDoorbellPress();
    const currentValue = this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
    return currentValue;
  }
}