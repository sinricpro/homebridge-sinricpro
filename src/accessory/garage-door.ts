import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Garage Door
 */
export class SinricProGarageDoor extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private states = {
    currentState: false,
    targetState: false,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.GARAGE_DOOR_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding Garage Door', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener)
      ?? this.accessory.addService(this.platform.Service.GarageDoorOpener);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState);
    this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
      .onSet(this.setTargetState.bind(this))
      .onGet(this.getTargetState.bind(this));

    this.states.currentState = ('OPEN' === this.accessory.context.device.garageDoorState?.toUpperCase());
  }

  /**
   * Updates the service with the new value.
   * @param action - setMode
   * @param value  - {"mode":"Open"} or {"mode":"Close"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if(action === ActionConstants.SET_MODE) {
      this.states.currentState = ('OPEN' === value.mode?.toUpperCase());
      this.accessory.context.device.garageDoorState = value.mode;
    }
  }

  async setTargetState(value: CharacteristicValue) {
    const tmpValue = value as boolean;
    this.platform.log.debug('setLockTargetState:', this.accessory.displayName, '=', tmpValue);

    if (this.states.targetState !== tmpValue) {
      this.states.targetState = tmpValue;
      super.setMode(tmpValue ? 'Open' : 'Close');
    }
  }

  async getTargetState(): Promise<CharacteristicValue> {
    const State = this.states.targetState;
    return State;
  }
}