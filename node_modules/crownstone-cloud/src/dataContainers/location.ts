import {CloudRequestorInterface} from "../tools/requestors";

export class Location {

  locationId = null;
  rest : CloudRequestorInterface;

  constructor(cloudRequestor: CloudRequestorInterface, locationId = null) {
    this.rest = cloudRequestor;
    this.locationId = locationId;
  }

  async data() : Promise<cloud_Location> {
    return await this.rest.getLocation(this.locationId);
  }

  async crownstones() : Promise<cloud_Stone[]> {
    return await this.rest.getCrownstonesInLocation(this.locationId);
  }

}