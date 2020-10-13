'use strict';



import {Util} from "../util/Util";
import {listeners} from "./sections/listeners";
import {webhookApiBase, WebhookStore} from "./sections/webhookApiBase";

function combineSections() {
  let result : any = {};
  Util.mixin(result, webhookApiBase, result);

  // mixin all modules.
  Util.mixin(result, listeners, result);

  return result;
}

interface WebhookAPI extends
  cloudApiBase_cloudModule,
  listeners_webhookModule
{
  setApiKey:   (api_key: string)     => this,
  setUserId:   (userId: string)      => this,
  forListener: (listenerId: string)  => this,
}


/**
 * This adds all sections into the REST
 */
export const WebhookAPI : WebhookAPI = combineSections();

WebhookAPI.setApiKey   = function(api_key)     : any  { WebhookStore.api_key = api_key;        return WebhookAPI; };
WebhookAPI.setUserId   = function(userId)      : any  { WebhookStore.userId  = userId;         return WebhookAPI; };
WebhookAPI.forListener = function(listenerId)  : any  { WebhookStore.listenerId  = listenerId; return WebhookAPI; };
