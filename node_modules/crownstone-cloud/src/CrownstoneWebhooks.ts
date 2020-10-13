import { Toolchain }                 from "./tools/toolchain";
import { WebhookRequestorInterface } from "./tools/requestors";
import {Logger} from "./Logger";

const log = Logger(__filename);

export class CrownstoneWebhooks {
  log = log;

  toolchain : Toolchain;
  rest: WebhookRequestorInterface;

  constructor(customEndpoint?:string) {
    this.toolchain = new Toolchain();
    this.rest = this.toolchain.getWebhookRequestor(customEndpoint);
  }

  setApiKey(apiKey: string) {
    this.toolchain.tokenStore.webhooks.api_key = apiKey;
  }

  setAdminKey(adminKey: string) {
    this.toolchain.tokenStore.webhooks.admin_key = adminKey;
  }

  async isListenerActiveByToken(token: string) : Promise<boolean> {
    return await this.rest.isListenerActive(token)
  }

  async isListenerActiveByUserId(userId: string) : Promise<boolean> {
    return await this.rest.isListenerActive('', userId)
  }

  async createListener(userId: string, token: string, eventTypes: string[], url: string) : Promise<void> {
    return await this.rest.createListener(userId, token, eventTypes, url);
  }

  async getListeners() : Promise<cloud_EventListener[]> {
    return await this.rest.getListeners();
  }

  async removeListenerByToken(token: string) : Promise<void> {
    return await this.rest.deleteListenerByToken(token);
  }
  async removeListenerByUserId(userId: string) : Promise<void> {
    return await this.rest.deleteListenerByUserId(userId);
  }



}