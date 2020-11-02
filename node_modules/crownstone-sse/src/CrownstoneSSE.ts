import Timeout = NodeJS.Timeout;

const crypto = require('crypto');
import EventSource from "eventsource"
const shasum = crypto.createHash('sha1');
import fetch from 'cross-fetch';
import {Logger} from "./Logger";

const log = Logger(__filename);

export const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};


interface sseOptions {
  sseUrl?:        string,
  loginUrl?:      string,
  hubLoginBase?:  string,
  autoreconnect?: boolean,
};

interface cachedLoginData {
  hub?:  {hubId: string, hubToken:       string},
  user?: {email: string, hashedPassword: string}
}

const DEFAULT_URLS = {
  sse:          "https://events.crownstone.rocks/sse",
  login:        "https://cloud.crownstone.rocks/api/users/login",
  hubLoginBase: "https://cloud.crownstone.rocks/api/Hubs/"
}

export class CrownstoneSSE {
  log = log;

  autoreconnect    : boolean       = false;

  eventSource      : EventSource   = null;
  accessToken      : string | null = null;

  eventCallback    : (data: SseEvent) => void;

  checkerInterval  : Timeout = null;
  reconnectTimeout : Timeout = null;
  pingTimeout      : Timeout = null;

  sse_url          = DEFAULT_URLS.sse;
  login_url        = DEFAULT_URLS.login;
  hubLogin_baseUrl = DEFAULT_URLS.hubLoginBase;

  cachedLoginData  : cachedLoginData = null;

  constructor( options? : sseOptions ) {
    this.sse_url          = options && options.sseUrl       || DEFAULT_URLS.sse;
    this.login_url        = options && options.loginUrl     || DEFAULT_URLS.login;
    this.hubLogin_baseUrl = options && options.hubLoginBase || DEFAULT_URLS.hubLoginBase;
    if (this.hubLogin_baseUrl.substr(-1,1) !== '/') { this.hubLogin_baseUrl += "/"; }
    this.autoreconnect    = (options && options.autoreconnect !== undefined) ? options.autoreconnect : true;
  }

  async login(email, password) {
    shasum.update(password);
    let hashedPassword = shasum.digest('hex');
    return await this.loginHashed(email, hashedPassword)
  }

  async loginHashed(email, sha1passwordHash) {
    this.cachedLoginData = {user: {email: email, hashedPassword: sha1passwordHash}};
    return fetch(
      this.login_url,
      {method:"POST", headers:defaultHeaders, body: JSON.stringify({email, password:sha1passwordHash})}
      )
      .then((result) => {
        return result.json()
      })
      .then((result) => {
        if (result?.error?.statusCode == 401) {
          throw result.error
        }
        this.accessToken = result.id;
        log.info("SSE user login successful.");
      })
      .catch((err) => {
        log.warn("SSE user login failed.", err);
        if (err?.code === "LOGIN_FAILED_EMAIL_NOT_VERIFIED") {
          console.info("This email address has not been verified yet.");
          throw err;
        }
        else if (err?.code === "LOGIN_FAILED") {
          console.info("Incorrect email/password");
          throw err;
        }
        else {
          console.error("Unknown error while trying to login to", this.login_url);
          throw err;
        }
      })
  }

  async hubLogin(hubId : string, hubToken: string) {
    this.cachedLoginData = {hub: {hubId: hubId, hubToken: hubToken}};
    let combinedUrl = this.hubLogin_baseUrl + hubId + '/login?token=' + hubToken;
    return fetch(
      combinedUrl,
      {method:"POST", headers:defaultHeaders}
    )
      .then((result) => {
        return result.json()
      })
      .then((result) => {
        if (result?.error?.statusCode == 401) {
          throw result.error
        }
        this.accessToken = result.id;
        log.info("SSE hub login successful.");
      })
      .catch((err) => {
        log.warn("SSE hub login failed.", err);
        if (err?.code === "LOGIN_FAILED") {
          console.info("Incorrect email/password");
          throw err;
        }
        else {
          console.error("Unknown error while trying to login to", combinedUrl);
          throw err;
        }
      })
  }

  async retryLogin() {
    if (this.cachedLoginData.hub !== undefined) {
      return this.hubLogin(this.cachedLoginData.hub.hubId, this.cachedLoginData.hub.hubToken)
    }
    else if (this.cachedLoginData.user !== undefined) {
      return this.loginHashed(this.cachedLoginData.user.email, this.cachedLoginData.user.hashedPassword)
    }
    throw "NO_CREDENTIALS";
  }

  setAccessToken(token) {
    this.accessToken = token;
  }


  stop() {
    this._clearPendingActions()
    this.autoreconnect = false;
    if (this.eventSource !== null) {
      this.eventSource.close();
    }
  }


  /**
   * The cloud will ping every 30 seconds. If this is not received after 40 seconds, we restart the connection.
   * @private
   */
  _messageReceived() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      if (this.eventCallback !== undefined) {
        this.start(this.eventCallback);
      }
    }, 40000);
  }


  _clearPendingActions() {
    clearInterval(this.checkerInterval);
    clearTimeout( this.reconnectTimeout);
    clearTimeout( this.pingTimeout);
  }


  async start(eventCallback : (data : SseEvent) => void) : Promise<void> {
    if (this.accessToken === null) {
      throw "AccessToken is required. Use .setAccessToken() or .login() to set one."
    }

    this.eventCallback = eventCallback;

    this._clearPendingActions();

    if (this.eventSource !== null) {
      log.info("Event source closed before starting again.");
      this.eventSource.close();
    }

    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(this.sse_url + "?accessToken=" + this.accessToken);
      this.eventSource.onopen = (event) => {
        console.log("Connection is open.");
        log.info("Event source connection established.");

        this._messageReceived();

        this.checkerInterval = setInterval(() => {
          if (this.eventSource.readyState === 2) { // 2 == CLOSED
            log.warn("Recovering connection....");
            this.start(this.eventCallback);
          }
        }, 1000);

        resolve();
      };

      this.eventSource.onmessage = (event) => {
        // bump the heartbeat timer.
        this._messageReceived();
        if (event?.data) {
          let message = JSON.parse(event.data);
          log.debug("Event received", message);

          this.eventCallback(message as any);

          // attempt to automatically reconnect if the token has expired.
          if (this.autoreconnect && message.type === 'system' && message.code === 401 && message.subtype == "TOKEN_EXPIRED" && this.cachedLoginData) {
            this._clearPendingActions();
            this.eventSource.close();
            try {
              return this.retryLogin()
                .then(() => {
                  return this.start(this.eventCallback);
                })
            }
            catch (e) {
              this.eventCallback({
                type:     "system",
                subType:  "COULD_NOT_REFRESH_TOKEN",
                code:     401,
                message:  "Token expired, autoreconnect tried to get a new one. This was not successful. Connection closed.",
              });
            }
          }


        }
      };
      this.eventSource.onerror = (event) => {
        clearInterval(this.checkerInterval);
        log.warn("Eventsource error",event);
        log.info("Reconnecting after error. Will start in 2 seconds.");
        console.log("Something went wrong with the connection. Attempting reconnect...");
        this.reconnectTimeout = setTimeout(() => { this.start(this.eventCallback) }, 2000);
      }

    })
  }
}
