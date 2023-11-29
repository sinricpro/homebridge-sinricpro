export interface SinricProDeviceType {
    code: string;
}

export interface SinricProDevice {
    id: number;
    name: string;
    powerState: string | undefined; // On or Off
    deviceType: SinricProDeviceType;
    room: Room;
}