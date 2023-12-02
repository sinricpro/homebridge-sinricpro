import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ActionConstants, ModelConstants } from '../constants';


/**
 * Sinric Pro - Dimmer Switch
 */
export class SinricProDimmableSwitch extends AccessoryController implements SinricProAccessory {
  private service: Service;

  private dimmerStates = {
    on: false,
    powerLevel: 100,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.DIMMABLE_SWIRCH_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding Dimmable Switch', this.accessory.displayName, accessory.context.device);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb)
      ?? this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.dimmerStates.powerLevel = accessory.context.device.powerLevel ?? 100;
    this.dimmerStates.on = ('ON' === accessory.context.device.powerState?.toUpperCase());

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .setProps({
        minValue: 1,
        maxValue: 100,
        validValueRanges: [1, 100],
      })
      .onGet(this.getBrightness.bind(this))
      .onSet(this.setBrightness.bind(this));
  }

  public updateState(action: string, value: any): void {
    this.platform.log.debug(`Updating DimmableSwitch: ${this.accessory.displayName} to ${value}`);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.dimmerStates.on = ('ON' === value.state.toUpperCase());
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.dimmerStates.on);
    } else if(action === ActionConstants.SET_POWER_LEVEL || ActionConstants.ADJUST_POWER_LEVEL) {
      this.dimmerStates.powerLevel = value.powerLevel;
      this.service.getCharacteristic(this.platform.Characteristic.Brightness).updateValue(this.dimmerStates.powerLevel);
    }
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.dimmerStates.on);
    return this.dimmerStates.on;
  }

  getBrightness(): CharacteristicValue {
    this.platform.log.debug('getBrightness:', this.accessory.displayName, '=', this.dimmerStates.powerLevel);
    return this.dimmerStates.powerLevel;
  }
}