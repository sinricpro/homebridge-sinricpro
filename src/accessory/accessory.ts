/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin (https://github.com/sinricpro/homebridge-sinricpro)
 */

export interface SinricProAccessory {
  sinricProDeviceId: string;
  updateState(action: string, value: any): void;
}

