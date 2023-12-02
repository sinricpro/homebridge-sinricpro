import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - Lock
 */
export class SinricProLock extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private states = {
    lockCurrentState: false,
    lockTargetState: false,
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

    this.platform.log.debug('Adding Lock', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.LockMechanism)
      ?? this.accessory.addService(this.platform.Service.LockMechanism);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the characteristic
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState);
    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onSet(this.setLockTargetState.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getLockTargetState.bind(this));

    this.states.lockCurrentState = ('LOCKED' === this.accessory.context.device.lockState?.toUpperCase());
  }

  /**
   * Updates the service with the new value.
   * @param action - setLockState
   * @param value  - {"state": "lock"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if(action === ActionConstants.SET_LOCK_STATE) {
      this.states.lockCurrentState = ('LOCKED' === value.state?.toUpperCase());
      this.accessory.context.device.lockState = value.state;
    }
  }

  async setLockTargetState(value: CharacteristicValue) {
    const tmpValue = value as boolean;
    this.platform.log.debug('setLockTargetState:', this.accessory.displayName, '=', tmpValue);

    if (this.states.lockTargetState !== tmpValue) {
      this.states.lockTargetState = tmpValue;
      super.setMode(tmpValue ? 'lock' : 'unlock');
    }
  }

  getLockTargetState(): CharacteristicValue {
    const isLock = this.states.lockCurrentState;
    return isLock;
  }
}