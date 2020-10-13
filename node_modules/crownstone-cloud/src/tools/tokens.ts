
class CrownstoneCloudUserTokens {
  email: string;
  passwordSha1: string;
  userId: string
}

class CrownstoneCloudHubTokens {
  hubId: string;
  hubToken: string;
  sphereId: string;
}

class CrownstoneHooksTokens {
  api_key : string;
  admin_key: string;

  userId: string;
  listenerId: string;
}

export class TokenStore {

  accessToken: string;
  cloudUser: CrownstoneCloudUserTokens
  cloudHub:  CrownstoneCloudHubTokens
  webhooks:  CrownstoneHooksTokens

  constructor() {
    this.cloudHub  = new CrownstoneCloudHubTokens();
    this.cloudUser = new CrownstoneCloudUserTokens();
    this.webhooks  = new CrownstoneHooksTokens();
  }

}