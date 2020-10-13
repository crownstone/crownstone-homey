import {Toolchain} from "./tools/toolchain";
import {CloudRequestorInterface} from "./tools/requestors";
import {User} from "./dataContainers/user";
import {Sphere} from "./dataContainers/sphere";
import {Location} from "./dataContainers/Location";
import {Crownstone} from "./dataContainers/crownstone";
import {Hub} from "./dataContainers/hub";
import {Logger} from "./Logger";
const crypto = require('crypto');
const log = Logger(__filename);

export class CrownstoneCloud {
  log = log;

  toolchain : Toolchain;
  rest: CloudRequestorInterface;

  constructor(customEndpoint?:string) {
    this.toolchain = new Toolchain();
    this.rest = this.toolchain.getCloudRequestor(customEndpoint);
  }

  async login(email: string, password: string) : Promise<UserLoginData> {
    let hashedPassword = this.hashPassword(password);
    return await this.loginHashed(email, hashedPassword)
  }

  async loginHashed(email: string, hashedPassword: string) : Promise<UserLoginData>  {
    this.toolchain.loadUserData(email, hashedPassword);
    let result = await this.rest.login();

    this.toolchain.loadAccessToken(result.id, result.userId);
    return {accessToken: result.id, ttl: result.ttl, userId: result.userId};
  }

  async hubLogin(hubId: string, hubToken: string) : Promise<HubLoginData> {
    this.toolchain.loadHubData(hubId, hubToken);
    let result = await this.rest.hubLogin();

    this.toolchain.loadAccessToken(result.id);
    return {accessToken: result.id, ttl: result.ttl};
  }

  hashPassword(plaintextPassword: string) : string {
    let shasum = crypto.createHash('sha1');
    shasum.update(String(plaintextPassword));
    let hashedPassword = shasum.digest('hex');
    return hashedPassword;
  }

  setAccessToken(accessToken: string, userId?: string) {
    this.toolchain.loadAccessToken(accessToken, userId);
  }

  async spheres() : Promise<cloud_Sphere[]> {
    let spheres = [];
    if (this.rest.isUser()) {
      spheres = await this.rest.getSpheres()
    } else if (this.rest.isHub()) {
      spheres = [await this.rest.getHubSphere()];
    }
    return spheres;
  }
  async locations() : Promise<cloud_Location[]> {
    return await this.rest.getLocations();
  }

  async crownstones() : Promise<cloud_Stone[]> {
    return await this.rest.getCrownstones();
  }


  async keys() : Promise<cloud_Keys[]> {
    if (this.toolchain.cache.keys !== null) {
      return this.toolchain.cache.keys;
    }
    else {
      return await this.rest.getKeys()
    }
  }

  sphere(id: string) : Sphere {
    if (!id) { throw new Error("Sphere ID is mandatory!"); }
    return new Sphere(this.rest, id);
  }

  location(id: string) : Location {
    if (!id) { throw new Error("Location ID is mandatory!"); }
    return new Location(this.rest, id);
  }

  crownstone(id: string) : Crownstone {
    if (!id) { throw new Error("Crownstone ID is mandatory!"); }
    return new Crownstone(this.rest, id);
  }

  me() : User {
    return new User(this.rest);
  }

  hub() : Hub {
    return new Hub(this.rest);
  }
}
