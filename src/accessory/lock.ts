import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Lock
 * https://developers.homebridge.io/#/service/LockMechanism
 */
export class SinricProLock extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private states = {
    lockCurrentState: 0,
    lockTargetState: 0,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.LOCK_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('[SinricProLock()]: Adding device:', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.LockMechanism)
      ?? this.accessory.addService(this.platform.Service.LockMechanism);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the characteristic
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState);

    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onSet(this.setLockTargetState.bind(this))
      .onGet(this.getLockTargetState.bind(this));

    // restore present device state.
    if('LOCKED' === this.accessory.context.device.lockState?.toUpperCase()) {
      this.states.lockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
    } else {
      this.states.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
    }
  }

  /**
   * Updates the service with the new value.
   * @param action - setLockState
   * @param value  - { mode: 'lock' }
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('[updateState()]:', this.accessory.displayName, 'action=', action, 'value=', value);

    if(action === ActionConstants.SET_LOCK_STATE) {
      if(('LOCKED' === value.state?.toUpperCase())) {
        this.states.lockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
      } else {
        this.states.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
      }

      this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(this.states.lockCurrentState);
      this.accessory.context.device.lockState = value.state;
    }
  }

  async setLockTargetState(value: CharacteristicValue) {
    const tmpValue = value as number;
    this.platform.log.debug('[setLockTargetState()]:', this.accessory.displayName, '=', tmpValue);

    if (this.states.lockTargetState !== tmpValue) {
      this.states.lockTargetState = tmpValue;
      super.setLockState(tmpValue ? 'lock' : 'unlock');
    }
  }

  getLockTargetState(): CharacteristicValue {
    const isLock = this.states.lockCurrentState;
    this.platform.log.debug('[getLockTargetState()]:', this.accessory.displayName, '=', isLock);
    return isLock;
  }
}