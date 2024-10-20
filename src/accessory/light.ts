/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin
 */

import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SinricProPlatform } from '../platform';
import { SinricProAccessory } from './accessory';
import { AccessoryController } from './accessory-controller';
import { ModelConstants, ActionConstants } from '../constants';
import { ColorConverter } from '../utils/color-converter';

/**
 * Sinric Pro - Light
 * https://developers.homebridge.io/#/service/Lightbulb
 */
export class SinricProLight
  extends AccessoryController
  implements SinricProAccessory
{
  private service: Service;

  private lightStates = {
    on: false,
    brightness: 100,
    hue: 0,
    saturation: 0,
    colorTemperature: 2700,
  };

  // Timer to debounce color updates
  private colorUpdateTimeout: NodeJS.Timeout | null = null;
  private readonly debounceTime = 100; // Debounce time in milliseconds

  constructor(
    private readonly platform: SinricProPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        ModelConstants.MANUFACTURER,
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        ModelConstants.LIGHT_MODEL,
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.sinricProDeviceId,
      );

    this.platform.log.debug(
      '[SinricProLight()]: Adding device:',
      this.accessory.displayName,
      accessory.context.device,
    );

    this.service =
      this.accessory.getService(this.platform.Service.Lightbulb) ??
      this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setPrimaryService(true);
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.name,
    );

    // Register handlers for the On/Off Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    // Register handlers for the Brightness Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));

    // Register handlers for Hue and Saturation Characteristics
    this.service
      .getCharacteristic(this.platform.Characteristic.Hue)
      .onSet(this.setHue.bind(this))
      .onGet(this.getHue.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this))
      .onGet(this.getSaturation.bind(this));

    // Register handler for Color Temperature Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onSet(this.setColorTemperature.bind(this))
      .onGet(this.getColorTemperature.bind(this));

    // Restore present device state.
    this.lightStates.brightness = accessory.context.device.brightness ?? 100;
    this.lightStates.on =
      'ON' === accessory.context.device.powerState?.toUpperCase();
    this.lightStates.hue = accessory.context.device.hue ?? 0;
    this.lightStates.saturation = accessory.context.device.saturation ?? 0;
    this.lightStates.colorTemperature = ColorConverter.miredsToKelvin(
      accessory.context.device.colorTemperature ?? 140,
    );
  }

  public updateState(action: string, value: any): void {
    this.platform.log.debug(
      '[updateState()]:',
      this.accessory.displayName,
      'action=',
      action,
      'value=',
      value,
    );

    if (action === ActionConstants.SET_POWER_STATE) {
      this.lightStates.on = 'ON' === value.state.toUpperCase();
      this.service
        .getCharacteristic(this.platform.Characteristic.On)
        .updateValue(this.lightStates.on);
    } else if (action === ActionConstants.SET_BRIGHTNESS) {
      this.lightStates.brightness = value.brightness;
      this.service
        .getCharacteristic(this.platform.Characteristic.Brightness)
        .updateValue(this.lightStates.brightness);
    } else if (action === ActionConstants.SET_COLOR) {
      const { r, g, b } = value.color;
      const hsv = ColorConverter.rgbToHsv(r, g, b);
      this.lightStates.hue = hsv.hue;
      this.lightStates.saturation = hsv.saturation;
      this.service
        .getCharacteristic(this.platform.Characteristic.Hue)
        .updateValue(this.lightStates.hue);
      this.service
        .getCharacteristic(this.platform.Characteristic.Saturation)
        .updateValue(this.lightStates.saturation);
    } else if (action === ActionConstants.SET_COLOR_TEMPERATURE) {
      this.lightStates.colorTemperature = value.colorTemperature;
      this.service
        .getCharacteristic(this.platform.Characteristic.ColorTemperature)
        .updateValue(
          ColorConverter.kelvinToMireds(this.lightStates.colorTemperature),
        );
    }
  }

  getPowerState(): CharacteristicValue {
    this.platform.log.debug(
      '[getPowerState()]:',
      this.accessory.displayName,
      '=',
      this.lightStates.on,
    );
    return this.lightStates.on;
  }

  getBrightness(): CharacteristicValue {
    this.platform.log.debug(
      '[getBrightness()]:',
      this.accessory.displayName,
      '=',
      this.lightStates.brightness,
    );
    return this.lightStates.brightness;
  }

  getHue(): CharacteristicValue {
    this.platform.log.debug(
      '[getHue()]:',
      this.accessory.displayName,
      '=',
      this.lightStates.hue,
    );
    return this.lightStates.hue;
  }

  getSaturation(): CharacteristicValue {
    this.platform.log.debug(
      '[getSaturation()]:',
      this.accessory.displayName,
      '=',
      this.lightStates.saturation,
    );
    return this.lightStates.saturation;
  }

  getColorTemperature(): CharacteristicValue {
    this.platform.log.debug(
      '[getColorTemperature()]:',
      this.accessory.displayName,
      '=',
      this.lightStates.colorTemperature,
    );
    return ColorConverter.kelvinToMireds(this.lightStates.colorTemperature);
  }

  /**
   * Schedules a color update with debounce logic.
   * If a new update comes within the debounce time, the timer is reset.
   */
  private scheduleColorUpdate() {
    if (this.colorUpdateTimeout) {
      clearTimeout(this.colorUpdateTimeout); // Reset the timer if it's already running
    }

    this.colorUpdateTimeout = setTimeout(async () => {
      const { hue, saturation } = this.lightStates;
      const rgb = ColorConverter.hsvToRgb(hue, saturation, 100);
      await this.setColor(rgb); // Send the updated color to the device
    }, this.debounceTime); // Trigger update after the debounce period
  }

  async setHue(value: CharacteristicValue) {
    this.lightStates.hue = value as number;
    this.scheduleColorUpdate(); // Schedule a color update
  }

  async setSaturation(value: CharacteristicValue) {
    this.lightStates.saturation = value as number;
    this.scheduleColorUpdate(); // Schedule a color update
  }
}
