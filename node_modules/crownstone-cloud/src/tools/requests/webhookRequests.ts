import {RequestorBase} from "../requestorBase";
import {req} from "../../util/request";

export class WebhookRequests extends RequestorBase {

  async isListenerActive(token: string = '', userId: string = '') : Promise<boolean> {
    const {body} = await req("GET",`${this.endpoint}listeners/active`, { ...this.hookSecurityApi, searchParams: {token, userId} , responseType: 'json' });
    return body;
  }


  async createListener(userId: string, token: string, eventTypes: string[], url: string) : Promise<void> {
    await req("POST",`${this.endpoint}listeners`, {
      json: { userId, token, eventTypes, url },
      ...this.hookSecurityApi,
      responseType: 'json'
    });
  }


  async getListeners() : Promise<cloud_EventListener[]> {
    const {body} = await req("GET",`${this.endpoint}listeners`, {
      ...this.hookSecurityApi,
      responseType: 'json'
    });
    return body;
  }

  async deleteListenerByToken(token: string) : Promise<void> {
    const {body} = await req("DELETE", `${this.endpoint}listeners/token`, {
      ...this.hookSecurityApi,
      searchParams: { token: token},
      responseType: 'json'
    });
    return body;
  }

  async deleteListenerByUserId(userId: string) : Promise<void> {
    const {body} = await req("DELETE", `${this.endpoint}listeners/userId`, {
      ...this.hookSecurityApi,
      searchParams: { userId: userId},
      responseType: 'json'
    });
    return body;
  }

}

