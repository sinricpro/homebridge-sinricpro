import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProAccessory, SinricProPlatform } from '../platform';
import { SinricProDevice } from '../sinricproApiClient';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SinricProSwitch implements SinricProAccessory {
  private service: Service;

  private switchStates = {
    On: false,
  };

  public sinricProDeviceId = "";

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.sinricProDeviceId = accessory.context.device.id;

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SinricPro')
      .setCharacteristic(this.platform.Characteristic.Model, 'SinricProSwitch')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, `SinricProDeviceId-${this.sinricProDeviceId}`);

    this.platform.log.debug('Adding Switch', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Switch)
      || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.switchStates.On = (accessory.context.device.powerState == 'On'); 

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setSwitchState.bind(this))                
      .onGet(this.getSwitchState.bind(this));
  }

  public updateState(device: SinricProDevice): void {
    this.platform.log.debug('Updating Switch state:', this.accessory.displayName);
    this.switchStates.On = device.powerState == 'On'; 
    this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.switchStates.On);    
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setSwitchState(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.switchStates.On = value as boolean;
    
    //TODO: Fix this later
    //this.platform.sinricProApiClient.setPowerState([{ id: this.sinricProDeviceId, powerState: value }]);
    this.platform.log.debug('Set switch to ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   */
  getSwitchState(): CharacteristicValue {
    this.platform.log.debug('Get Switch state for:', this.accessory.displayName, this.switchStates);
    return this.switchStates.On;
  } 
}