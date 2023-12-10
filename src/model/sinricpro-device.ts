/*
 *  Copyright (c) 2019-2023 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro - Homebridge Plugin (https://github.com/sinricpro/homebridge-sinricpro)
 */
export interface SinricProDeviceType {
    code: string;
}

export interface SinricProDevice {
    id: number;
    name: string;
    deviceType: SinricProDeviceType;
    powerState?: string;
    rangeValue?: number;
    garageDoorState?: number;
    brightness?: number;
    powerLevel?: number;
    temperature?: number;
    thermostatMode?: string;
    contactState?: string;
    humidity?: number;
    lastMotionState?: string;
}