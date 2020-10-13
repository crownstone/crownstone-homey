import { TokenStore } from "./tokens";
import {CloudRequestor, CloudRequestorInterface, WebhookRequestor, WebhookRequestorInterface} from "./requestors";
import { CacheStorage } from "./cache";



export class Toolchain {

  tokenStore : TokenStore;
  cache      : CacheStorage;

  constructor() {
    this.tokenStore = new TokenStore();
    this.cache      = new CacheStorage();
  }

  loadUserData(email: string, passwordSha1: string) {
    this.tokenStore.cloudUser.email        = email;
    this.tokenStore.cloudUser.passwordSha1 = passwordSha1;
  }

  loadAccessToken(accessToken, userId?: string) {
    this.tokenStore.accessToken      = accessToken;
    if (userId) { this.tokenStore.cloudUser.userId = userId; }
  }
  loadHubData(hubId: string, hubToken: string) {
    this.tokenStore.cloudHub.hubId       = hubId;
    this.tokenStore.cloudHub.hubToken    = hubToken;
  }
  loadHubSphereId(sphereId: string) {
    this.tokenStore.cloudHub.sphereId = sphereId;
  }

  getCloudRequestor(customEndpoint?: string) : CloudRequestorInterface {
    return new CloudRequestor(this.tokenStore, this.cache, customEndpoint).interface()
  }

  getWebhookRequestor(customEndpoint?: string) : WebhookRequestorInterface {
    return new WebhookRequestor(this.tokenStore, this.cache, customEndpoint).interface()
  }
}