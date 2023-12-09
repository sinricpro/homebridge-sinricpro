export interface SinricProDeviceType {
    code: string;
}

export interface SinricProDevice {
    id: number;
    name: string;
    deviceType: SinricProDeviceType;
    room: Room;
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