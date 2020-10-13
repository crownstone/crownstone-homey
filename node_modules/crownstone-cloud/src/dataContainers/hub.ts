import {CloudRequestorInterface} from "../tools/requestors";

export class Hub {

  rest: CloudRequestorInterface;

  constructor(cloudRequestor: CloudRequestorInterface) {
    this.rest = cloudRequestor;
  }

  async setLocalIpAddress(ipAddress) : Promise<void> {
    return this.rest.hubSetLocalIpAddress(ipAddress)
  }

  async uploadEnergyMeasurements(measurementData: EnergyMeasurementData) : Promise<void> {
    return this.rest.uploadEnergyMeasurementData(measurementData);
  }

}