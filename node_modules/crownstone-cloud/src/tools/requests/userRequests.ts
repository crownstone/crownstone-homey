import {RequestorBase} from "../requestorBase";
import {req} from "../../util/request";


export class UserRequests extends RequestorBase {

  async login() : Promise<cloud_LoginReply> {
    const {body} = await req("POST", `${this.endpoint}users/login`, {
      json: {
        email: this.tokenStore.cloudUser.email,
        password: this.tokenStore.cloudUser.passwordSha1,
        ttl: 7*24*3600
      },
      responseType: 'json'
    });
    return body;
  }


  async getKeys() : Promise<cloud_Keys[]> {
    if (this.tokenStore.cloudUser.userId === undefined) { throw "No user logged in. If you logged in as a hub, remember that hubs cannot get keys."; }

    const {body} = await req("GET",`${this.endpoint}users/${this.tokenStore.cloudUser.userId}/keysV2`, this.addSecurity({ responseType: 'json' }));
    return body as any;
  }

  async getUserData() : Promise<cloud_UserData> {
    const {body} = await req("GET",`${this.endpoint}users/me`,  this.addSecurity({ responseType: 'json' }));
    let userData = body as any;
    // this.cache.user = userData;
    return userData;
  }

  async getUserId() : Promise<string> {
    const {body} = await req("GET",`${this.endpoint}users/userId`, this.addSecurity({ responseType: 'json' }));
    this.tokenStore.cloudUser.userId = body;
    return body;
  }

  async getCurrentLocation(userId) : Promise<cloud_UserLocation> {
    const {body} = await req("GET",`${this.endpoint}users/${userId}/currentLocation`, this.addSecurity({ responseType: 'json' }));
    return body as any;
  }

}


