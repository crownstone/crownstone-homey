import {RequestorBase} from "../requestorBase";
import {req} from "../../util/request";


export class SphereRequests extends RequestorBase {

  async getSpheres() : Promise<cloud_Sphere[]> {
    const {body} = await req("GET",`${this.endpoint}users/${this.tokenStore.cloudUser.userId}/spheres`, this.addSecurity({responseType: 'json' }));

    // this.cache.downloadedAll['spheres'] = true;
    return body as any;
  }

  async getSphere(sphereId) : Promise<cloud_Sphere> {
    const {body} = await req("GET",`${this.endpoint}Spheres/${sphereId}`, this.addSecurity({ responseType: 'json' }));
    return body as any;
  }

  async getUsers(sphereId) : Promise<cloud_sphereUserDataSet> {
    const {body} = await req("GET",`${this.endpoint}Spheres/${sphereId}/users`, this.addSecurity({ responseType: 'json' }));

    // if (!this.cache.downloadedAllInSphere[sphereId]) {
    //   this.cache.downloadedAllInSphere[sphereId] = {};
    // }
    // this.cache.downloadedAllInSphere[sphereId].users = true;

    return body as any;
  }

  async getSphereAuthorizationTokens(sphereId) : Promise<cloud_SphereAuthorizationTokens> {
    const {body} = await req("GET",`${this.endpoint}Spheres/${sphereId}/tokenData`, this.addSecurity({ responseType: 'json' }));
    return body as any;
  }

  async getHubSphereId() : Promise<string> {
    if (this.tokenStore.cloudHub.hubId    === undefined) { throw "No Hub loaded."; }
    if (this.tokenStore.cloudHub.sphereId === undefined) {
      let {body} = await req("GET",`${this.endpoint}Hubs/${this.tokenStore.cloudHub.hubId}`, this.addSecurity({ responseType: 'json' }));
      let hubData = body as any;
      // this.cache.hubs[hubData.id] = hubData;
      let sphereId = hubData.sphereId;
      this.tokenStore.cloudHub.sphereId = sphereId;
      return sphereId;
    }
    else {
      return this.tokenStore.cloudHub.sphereId;
    }
  }
  async getHubSphere() : Promise<cloud_Sphere> {
    let sphereId = await this.getHubSphereId()
    return await this.getSphere(sphereId);
  }

  async getPresentPeople(sphereId, ignoreDeviceId? : string) : Promise<SpherePresentPeople[]> {
    const {body} = await req("GET",`${this.endpoint}Spheres/${sphereId}/presentPeople`, this.addSecurity({ searchParams: { ignoreDeviceId: ignoreDeviceId }, responseType: 'json' }));
    return body as any;
  }

  async uploadEnergyMeasurementData(energyMeasurementData: EnergyMeasurementData) : Promise<void> {
    if (this.tokenStore.cloudHub.sphereId === undefined) {
      await this.getHubSphereId();
    }
    await req("POST",`${this.endpoint}Spheres/${this.tokenStore.cloudHub.sphereId}/energyMeasurements`, this.addSecurity({ json: energyMeasurementData }));
  }

}


