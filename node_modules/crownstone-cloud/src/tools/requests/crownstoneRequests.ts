import {RequestorBase} from "../requestorBase";
import {req} from "../../util/request";


let filter = {searchParams: {filter: JSON.stringify({"include":["locations", "currentSwitchState", {"abilities":"properties"}, "behaviours"]})}}

export class CrownstoneRequests extends RequestorBase {

  async getCrownstones() : Promise<cloud_Stone[]> {
    const {body} = await req("GET",`${this.endpoint}Stones/all`,this.addSecurity( { ...filter, responseType: 'json' }));
    return body as any;
  }

  async getCrownstonesInSphere(sphereId) : Promise<cloud_Stone[]> {
    const {body} = await req("GET", `${this.endpoint}Spheres/${sphereId}/ownedStones`, this.addSecurity({ ...filter, responseType: 'json' }));
    return body as any;
  }
  async getCrownstonesInLocation(locationId) : Promise<cloud_Stone[]> {
    const {body} = await req("GET", `${this.endpoint}Locations/${locationId}/stones`, this.addSecurity({ ...filter, responseType: 'json' }));
    return body as any;
  }

  async getCrownstone(stoneId) : Promise<cloud_Stone> {
    const {body} = await req("GET",`${this.endpoint}Stones/${stoneId}`, this.addSecurity({ ...filter, responseType: 'json' }));
    return body as any;
  }

  async switchCrownstone(stoneId, stoneSwitchData: StoneSwitchData) : Promise<void> {
    await req("POST",`${this.endpoint}Stones/${stoneId}/switch`, this.addSecurity({ json: stoneSwitchData }));
  }

  async getCurrentSwitchState(stoneId) : Promise<cloud_SwitchState> {
    const {body} = await req("GET",`${this.endpoint}Stones/${stoneId}/currentSwitchStateV2`, this.addSecurity({ responseType: 'json' }));
    return body as any;
  }

  async setCurrentSwitchState(stoneId, switchState: number) : Promise<void> {
    await req("POST",`${this.endpoint}Stones/${stoneId}/currentSwitchStateV2`, this.addSecurity({ searchParams: { switchState: switchState}, responseType: 'json' }));
  }
}

