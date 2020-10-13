import {Util} from "../util/Util"

export class CrownstoneSettings {
  encryptionEnabled = true;

  adminKey          : Buffer = null;
  memberKey         : Buffer = null;
  basicKey          : Buffer = null;
  serviceDataKey    : Buffer = null;
  localizationKey   : Buffer = null;
  meshNetworkKey    : Buffer = null;
  meshAppKey        : Buffer = null;
  setupKey          : Buffer = null;

  initializedKeys  = false;

  loadKeys(encryptionEnabled, adminKey : string = null, memberKey : string = null, basicKey : string = null, serviceDataKey : string = null, localizationKey : string = null, meshNetworkKey : string = null, meshAppKey : string = null, referenceId) {
    this.encryptionEnabled = encryptionEnabled;

    this.adminKey        = this._prepKey(adminKey);
    this.memberKey       = this._prepKey(memberKey);
    this.basicKey        = this._prepKey(basicKey);
    this.serviceDataKey  = this._prepKey(serviceDataKey);
    this.localizationKey = this._prepKey(localizationKey);
    this.meshNetworkKey  = this._prepKey(meshNetworkKey);
    this.meshAppKey      = this._prepKey(meshAppKey);

    this.initializedKeys = true;
  }

  _prepKey(key) {
    return Util.prepareKey(key);
  }

  // determineUserLevel() {
  //   if (this.adminKey.length == 16) {
  //     this.userLevel = UserLevel.admin
  //   }
  //   else if (this.memberKey.length == 16) {
  //     this.userLevel = UserLevel.member
  //   }
  //   else if (this.basicKey.length == 16) {
  //     this.userLevel = UserLevel.basic;
  //   }
  //   else {
  //     this.userLevel = UserLevel.unknown;
  //     this.initializedKeys = false
  //   }
  // }
}



