import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants } from '../constants';
import { ActionConstants } from '../constants';

/**
 * Sinric Pro - TV
 */
export class SinricProTV extends AccessoryController implements SinricProAccessory {
  private tvService: Service;
  private speakerService: Service;

  private tvStates = {
    on: false,
    currentVolume: 100,
    mute: false,
  };

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, ModelConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, ModelConstants.TV_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.sinricProDeviceId);

    this.platform.log.debug('Adding TV', this.accessory.displayName, accessory.context.device);

    this.tvService = this.accessory.getService(this.platform.Service.Television)
      ?? this.accessory.addService(this.platform.Service.Television);
    this.tvService.setPrimaryService(true);
    this.tvService.setCharacteristic(this.platform.Characteristic.ConfiguredName, this.accessory.context.device.displayName)
      .setCharacteristic(
        this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE,
      );

    // register handlers for the characteristic
    this.tvService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    this.tvService.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet(this.setRemoteKey.bind(this));

    // Bind to TV speaker events.
    this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
      ?? this.accessory.addService(this.platform.Service.TelevisionSpeaker);

    this.speakerService
      .setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
      .setCharacteristic(
        this.platform.Characteristic.VolumeControlType,
        this.platform.Characteristic.VolumeControlType.ABSOLUTE,
      );

    this.speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));

    this.speakerService.getCharacteristic(this.platform.Characteristic.Mute)
      .onSet(this.setMute.bind(this))
      .onGet(this.getMute.bind(this));

    // Add the TV speaker to the TV.
    this.tvService.addLinkedService(this.speakerService);
    this.tvStates.on = ('ON' === accessory.context.device.powerState?.toUpperCase());
  }

  /**
   * Updates the service with the new value.
   * @param action - setPowerState
   * @param value  - The message containing the new value. eg: {"state":"Off"}
   */
  public updateState(action: string, value: any): void {
    this.platform.log.debug('Updating:', this.accessory.displayName, '=', value);

    if(action === ActionConstants.SET_POWER_STATE) {
      this.tvStates.on = 'ON' === value.state.toUpperCase();
      this.tvService.getCharacteristic(this.platform.Characteristic.On).updateValue(this.tvStates.on);
    }
  }

  async setVolume(value: CharacteristicValue) {
    const tmpVolumeSelectorValue = value as number;

    if (tmpVolumeSelectorValue === this.platform.Characteristic.VolumeSelector.INCREMENT) {
      if (this.tvStates.currentVolume + 1 <= 100) {
        this.tvStates.currentVolume++;
      }
    } else {
      if (this.tvStates.currentVolume - 1 >= 0) {
        this.tvStates.currentVolume--;
      }
    }
  }

  getVolume(): CharacteristicValue {
    const volume = this.tvStates.currentVolume;
    return volume;
  }

  async setMute(direction: CharacteristicValue) {
    this.platform.log.debug('Toggling Mute');
  }

  getMute(): CharacteristicValue {
    const mute = this.tvStates.mute;
    return mute;
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug('getPowerState:', this.accessory.displayName, '=', this.tvStates.on);
    return this.tvStates.on;
  }

  async setInputState(inputIndex: CharacteristicValue) {
    try {
      if (typeof inputIndex !== 'number') {
        return;
      }

    } catch (error) {
      this.platform.log.error((error as Error).message);
    }
  }

  setRemoteKey(newValue: CharacteristicValue, callback: CharacteristicSetCallback) {
    let keyName = '';
    switch(newValue) {
      case this.platform.Characteristic.RemoteKey.REWIND: {
        this.platform.log.debug('set Remote Key Pressed: REWIND');
        keyName = 'rewind';
        break;
      }
      case this.platform.Characteristic.RemoteKey.FAST_FORWARD: {
        this.platform.log.debug('set Remote Key Pressed: FAST_FORWARD');
        keyName = 'fast_forward';
        break;
      }
      case this.platform.Characteristic.RemoteKey.NEXT_TRACK: {
        this.platform.log.debug('unsupported Remote Key Pressed: NEXT_TRACK, ignoring.');
        return;
      }
      case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK: {
        this.platform.log.debug('unsupported Remote Key Pressed: PREVIOUS_TRACK, ignoring.');
        return;
      }
      case this.platform.Characteristic.RemoteKey.ARROW_UP: {
        this.platform.log.debug('set Remote Key Pressed: ARROW_UP');
        keyName = 'up';
        break;
      }
      case this.platform.Characteristic.RemoteKey.ARROW_DOWN: {
        this.platform.log.debug('set Remote Key Pressed: ARROW_DOWN');
        keyName = 'down';
        break;
      }
      case this.platform.Characteristic.RemoteKey.ARROW_LEFT: {
        this.platform.log.debug('set Remote Key Pressed: ARROW_LEFT');
        keyName = 'left';
        break;
      }
      case this.platform.Characteristic.RemoteKey.ARROW_RIGHT: {
        this.platform.log.debug('set Remote Key Pressed: ARROW_RIGHT');
        keyName = 'right';
        break;
      }
      case this.platform.Characteristic.RemoteKey.SELECT: {
        this.platform.log.debug('set Remote Key Pressed: SELECT');
        keyName = 'ok';
        break;
      }
      case this.platform.Characteristic.RemoteKey.BACK: {
        this.platform.log.debug('set Remote Key Pressed: BACK');
        keyName = 'back';
        break;
      }
      case this.platform.Characteristic.RemoteKey.EXIT: {
        this.platform.log.debug('set Remote Key Pressed: EXIT');
        keyName = 'exit';
        break;
      }
      case this.platform.Characteristic.RemoteKey.PLAY_PAUSE: {
        this.platform.log.debug('set Remote Key Pressed: PLAY_PAUSE');
        keyName = 'play';
        break;
      }
      case this.platform.Characteristic.RemoteKey.INFORMATION: {
        this.platform.log.debug('set Remote Key Pressed: INFORMATION');
        keyName = 'home';
        break;
      }
    }

    // TODO: Send keyName
  }
}