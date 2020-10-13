import {CloudRequestorInterface} from "../tools/requestors";


export class User {

  rest: CloudRequestorInterface;

  constructor(cloudRequestor: CloudRequestorInterface) {
    this.rest = cloudRequestor;
  }

  async data() : Promise<cloud_UserData> {
    return this.rest.getUserData()
  }

  async id() : Promise<string> {
    if (!this.rest.tokenStore.cloudUser.userId) {
      await this.rest.getUserId();
      return this.id();
    }
    else {
      return this.rest.tokenStore.cloudUser.userId;
    }
  }

  async currentLocation() : Promise<cloud_UserLocation> {
    let userId = await this.id();
    return this.rest.getCurrentLocation(userId);
  }

}