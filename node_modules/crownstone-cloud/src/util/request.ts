import got from "got";
import {Logger} from "../Logger";

type requestType = "POST" | "GET" | "DELETE" | "PUT" | "PATCH"
const log = Logger(__filename);


export async function req(type: requestType, url: string, options) : Promise<any> {
  let token = Math.floor(Math.random()*1e8).toString(36);
  logRequest(type, url, options, token);
  let result;
  try {
    switch (type) {
      case "POST":
        result = await got.post(url, options); break;
      case "GET":
        result = await got.get(url, options); break;
      case "DELETE":
        result = await got.delete(url, options); break;
      case "PUT":
        result = await got.put(url, options); break;
      case "PATCH":
        result = await got.patch(url, options); break;
    }
    log.debug("Request result:", result.statusCode, result.body, token);
    log.info("Request successful", result.statusCode, token);
    return result;
  }
  catch (err) {
    if (err.response) {
      // response error
      let statusCode = err.response.statusCode;
      let body = err.response.body;
      let messageInBody = err.response.body?.err?.message;
      let codeInBody = err.response.body?.err?.code;

      let error = {statusCode, body, message: messageInBody, code: codeInBody};
      log.error("Something went wrong with request", token, error);
      throw error;
    }
    else if (err.request) {
      // error during request

    }
    log.error("Something went wrong with request", token, err);
    throw err;
  }
}


function logRequest(type: requestType, url: string, options, token: string) {
  let headers = options.headers || null;
  let queryParams = options.searchParams || null;
  let bodyParams = options.json || null;
  let responseType = options.responseType;

  log.info("sending", type, "request to", url, 'headers:', headers, 'queryParams:', queryParams, 'bodyParams:', bodyParams, 'responseType', responseType, token);
}