'use strict';

import { bootloader }        from './sections/bootloader'
import { cloudApiBase, TokenStore } from "./sections/cloudApiBase";
import { devices }           from './sections/devices'
import { firmware }          from './sections/firmware'
import { fingerprints }      from './sections/fingerprints'
import { installations }     from './sections/installations'
import { locations }         from './sections/locations'
import { messages }          from './sections/messages'
import { preferences }       from './sections/preferences'
import { stones }            from './sections/stones'
import { stonesAbilities }   from './sections/stonesAbilities'
import { stonesBehaviours }  from './sections/stonesBehaviours'
import { spheres }           from './sections/spheres'
import { user }              from './sections/user'

import {Util} from "../util/Util";
import {hub} from "./sections/hub";


function combineSections() {
  let result : any = {};
  Util.mixin(result, cloudApiBase, result);

  // mixin all modules.
  Util.mixin(result, bootloader,        result);
  Util.mixin(result, devices,           result);
  Util.mixin(result, firmware,          result);
  Util.mixin(result, fingerprints,      result);
  Util.mixin(result, installations,     result);
  Util.mixin(result, locations,         result);
  Util.mixin(result, hub,               result);
  Util.mixin(result, messages,          result);
  Util.mixin(result, preferences,       result);
  Util.mixin(result, spheres,           result);
  Util.mixin(result, stones,            result);
  Util.mixin(result, stonesAbilities,   result);
  Util.mixin(result, stonesBehaviours,  result);
  Util.mixin(result, user,              result);

  return result;
}

interface REST_api extends
  cloudApiBase_cloudModule,
  bootloader_cloudModule,
  devices_cloudModule,
  firmware_cloudModule,
  fingerprints_cloudModule,
  installations_cloudModule,
  locations_cloudModule,
  hub_cloudModule,
  messages_cloudModule,
  preferences_cloudModule,
  spheres_cloudModule,
  stones_cloudModule,
  stonesAbilities_cloudModule,
  stonesBehaviours_cloudModule,
  user_cloudModule {
  setAccessToken:  (token: string)       => this,
  setUserId:       (userId: string)      => this,
  forUser:         (userId: string)      => this,
  forDevice:       (deviceId: string)    => this,
  forInstallation: (installationId: string) => this,
  forStone:        (stoneId: string)     => this,
  forSphere:       (sphereId: string)    => this,
  forLocation:     (locationId: string)  => this,
  forMessage:      (messageId: string)   => this,
  forHub:          (hubId: string)       => this,
}


/**
 * This adds all sections into the REST
 */
export const REST : REST_api = combineSections();

REST.setAccessToken =     function(accessToken)     : any  { TokenStore.accessToken = accessToken;       return REST; };
REST.setUserId =          function(userId)          : any  { TokenStore.userId      = userId;            return REST; };
REST.forUser =            function(userId)          : any  { TokenStore.userId      = userId;            return REST; };
REST.forDevice =          function(deviceId)        : any  { TokenStore.deviceId    = deviceId;          return REST; };
REST.forInstallation =    function(installationId)  : any  { TokenStore.installationId = installationId; return REST; };
REST.forStone =           function(stoneId)         : any  { TokenStore.stoneId     = stoneId;           return REST; };
REST.forSphere =          function(sphereId)        : any  { TokenStore.sphereId    = sphereId;          return REST; };
REST.forLocation =        function(locationId)      : any  { TokenStore.locationId  = locationId;        return REST; };
REST.forMessage =         function(messageId)       : any  { TokenStore.messageId   = messageId;         return REST; };
REST.forHub =             function(hubId)           : any  { TokenStore.hubId       = hubId;             return REST; };
