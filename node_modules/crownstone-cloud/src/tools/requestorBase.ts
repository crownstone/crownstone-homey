import {TokenStore} from "./tokens";
import {CacheStorage} from "./cache";

export class RequestorBase {
  endpoint : string;

  tokenStore : TokenStore;

  constructor(tokenStore: TokenStore, cache: CacheStorage) {
    this.tokenStore = tokenStore;
  }

  setEndpoint(endpoint: string) {
    if (endpoint[endpoint.length-1] !== '/') {
      this.endpoint = endpoint + '/';
    }
    else {
      this.endpoint = endpoint;
    }
  }

  addSecurity(options) : any {
    if (this.tokenStore.accessToken) {
      if (this.tokenStore.accessToken.length > 32) {
        return {...options, headers: {...options.headers, Authorization: this.tokenStore.accessToken}};
      } else {
        return {...options, searchParams: {...options.searchParams, access_token: this.tokenStore.accessToken}};
      }
    }

    return options;
  }

  get hookSecurityAdmin() {
    if (this.tokenStore.webhooks.admin_key) {
      return { headers: { admin_key: this.tokenStore.webhooks.admin_key } };
    }
    return {};
  }

  get hookSecurityApi() {
    if (this.tokenStore.webhooks.api_key) {
      return { headers: { api_key: this.tokenStore.webhooks.api_key } };
    }
    return {};
  }
}

