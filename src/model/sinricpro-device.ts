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
    powerState: string | undefined; // On or Off
    rangeValue: number | undefined;
    garageDoorState: number | undefined;
    brightness: number | undefined;
    powerLevel: number | undefined;
    temperature: number | undefined;
    thermostatMode: string | undefined;
    contactState: string | undefined;
    humidity: number | undefined;
    lastMotionState: string | undefined;
}