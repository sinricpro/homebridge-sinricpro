export interface SinricProAccessory {
  sinricProDeviceId: string;
  updateState(action: string, value: any): void;
}

