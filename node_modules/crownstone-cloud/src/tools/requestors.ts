import { TokenStore }         from "./tokens";
import { CacheStorage }       from "./cache";
import { Util }               from "../util/Util";

import { RequestorBase }      from "./requestorBase";
import { CrownstoneRequests } from "./requests/crownstoneRequests";
import { SphereRequests }     from "./requests/sphereRequests";
import { UserRequests }       from "./requests/userRequests";
import { HubRequests }        from "./requests/hubRequests";
import { LocationRequests}    from "./requests/locationRequests";
import {WebhookRequests} from "./requests/webhookRequests";



export class CloudRequestor extends RequestorBase {

  constructor(tokenStore: TokenStore, cache: CacheStorage, customEndpoint: string = 'https://cloud.crownstone.rocks/api/') {
    super(tokenStore, cache);
    this.setEndpoint(customEndpoint);
  }


  isUser() : boolean {
    return this.tokenStore.cloudUser.userId !== undefined;
  }

  isHub() : boolean {
    return this.tokenStore.cloudHub.hubToken !== undefined;
  }

  interface() : CloudRequestorInterface {
    // @ts-ignore
    return this;
  }
}

export interface CloudRequestorInterface extends CloudRequestor,
                                                 SphereRequests,
                                                 CrownstoneRequests,
                                                 LocationRequests,
                                                 UserRequests,
                                                 HubRequests {}

Util.applyMixins(CloudRequestor, [
  UserRequests,
  LocationRequests,
  HubRequests,
  SphereRequests,
  CrownstoneRequests
])


export class WebhookRequestor extends RequestorBase {

  constructor(tokenStore: TokenStore, cache: CacheStorage, customEndpoint: string = 'https://webhooks.crownstone.rocks/api/') {
    super(tokenStore, cache);
    this.setEndpoint(customEndpoint);
  }

  interface() : WebhookRequestorInterface {
    // @ts-ignore
    return this;
  }
}

export interface WebhookRequestorInterface extends WebhookRequestor,
  WebhookRequests {}

Util.applyMixins(WebhookRequestor, [
  WebhookRequests,
])