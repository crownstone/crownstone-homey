import {CloudRequestorInterface} from "../tools/requestors";

export class Sphere {

  rest: CloudRequestorInterface;
  sphereId = null;

  constructor(cloudRequestor: CloudRequestorInterface, id = null) {
    this.rest = cloudRequestor;
    this.sphereId = id;
  }

  async users() : Promise<cloud_sphereUserDataSet>{
    return await this.rest.getUsers(this.sphereId);
  }

  async authorizationTokens() : Promise<cloud_SphereAuthorizationTokens> {
    return await this.rest.getSphereAuthorizationTokens(this.sphereId);
  }

  async crownstones() : Promise<cloud_Stone[]> {
    return await this.rest.getCrownstonesInSphere(this.sphereId);
  }


  async locations() : Promise<cloud_Location[]> {
    return await this.rest.getLocationsInSphere(this.sphereId);
  }

  async keys() : Promise<cloud_Keys | null> {
    let keys = await this.rest.getKeys()

    for (let i = 0; i < keys.length; i++) {
      if (keys[i].sphereId === this.sphereId) {
        return keys[i];
      }
    }

    return null
  }

  async data() : Promise<cloud_Sphere> {
    return this.rest.getSphere(this.sphereId)
  }

}