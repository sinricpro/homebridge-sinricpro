import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Garage Door
 * https://developers.homebridge.io/#/service/GarageDoorOpener
 */
export class SinricProGarageDoor extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private states = {
    currentState: 0,
    targetState: 0,
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

    this.platform.log.debug('[SinricProGarageDoor()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener)
      ?? this.accessory.addService(this.platform.Service.GarageDoorOpener);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
      .onGet(this.getCurrentDoorState.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
      .onSet(this.setTargetState.bind(this))
      .onGet(this.getTargetState.bind(this));

    // restore present device state.
    if('OPEN' === this.accessory.context.device.garageDoorState?.toUpperCase()) {
      this.states.currentState = this.platform.Characteristic.TargetDoorState.OPEN;
    } else {
      this.states.currentState = this.platform.Characteristic.TargetDoorState.CLOSED;
    }
  }

  /**
   * Updates the service with the new value.
   * @param action - setMode
   * @param value  - {"mode":"Open"} or {"mode":"Close"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.SET_MODE) {
      if('OPEN' === value.mode?.toUpperCase()) {
        this.states.currentState = this.platform.Characteristic.TargetDoorState.OPEN;
      } else {
        this.states.currentState = this.platform.Characteristic.TargetDoorState.CLOSED;
      }
      this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState).updateValue(this.states.currentState);
      this.accessory.context.device.garageDoorState = value.mode;
    }
  }

  async setTargetState(value: CharacteristicValue) {
    const tmpValue = value as number;
    this.platform.log.debug('[setTargetState()]:', this.accessory.displayName, '=', tmpValue);

    if (this.states.targetState !== tmpValue) {
      this.states.targetState = tmpValue;
      super.setMode(tmpValue === 1 ? 'Open' : 'Close');
    }
  }

  getTargetState() : CharacteristicValue {
    const State = this.states.targetState;
    this.platform.log.info('[getTargetState()]:', this.accessory.displayName, 'targetState', State);
    return State;
  }

  getCurrentDoorState(): CharacteristicValue {
    this.platform.log.info('[getCurrentDoorState()]:', this.accessory.displayName, 'currentState', this.states.currentState);
    return this.states.currentState;
  }
}