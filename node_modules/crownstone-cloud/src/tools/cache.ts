
export class CacheStorage {

  downloadedAll = { spheres: false, crownstones: false, locations: false }
  downloadedAllInSphere: { [sphereId: string] : {crownstones?: boolean, locations?: boolean, users?: boolean }} = {}

  spheres:      { [sphereId: string]   : cloud_Sphere   } = {};
  crownstones:  { [stoneId: string]    : cloud_Stone    } = {};
  locations:    { [locationId: string] : cloud_Location } = {};
  sphereUsers:  { [sphereId: string]   : cloud_sphereUserDataSet } = {};
  users:        { [userId: string]     : cloud_User     } = {};
  keys:           cloud_Keys[] = null;
  hubs:         { [hubId: string]      : cloud_Hub      } = {};
  user:         cloud_UserData = null

  findSpheres(filter: filter) : cloud_Sphere[] {
    let lowerCaseIdentifier = String(filter).toLowerCase();
    return this._find(filter, this.spheres, (item) => {
      if (String(item.uid) === String(filter)){
        return item;
      }
      else if (item.uuid.toLowerCase() === lowerCaseIdentifier) {
        return item;
      }
    });
  }

  findCrownstones(filter: filter) : cloud_Stone[] {
    return this._find(filter, this.crownstones);
  }

  findLocations(filter: filter) : cloud_Location[] {
    return this._find(filter, this.locations, (item) => {
      if (String(item.uid) === String(filter)){
        return item;
      }})
  }

  findUsers(filter: filter) : cloud_User[] {
    return this._find(filter, this.users);
  }
  
  _find(filter: filter, container, specifics?) : any[] {
    let result = [];
    let lowerCaseIdentifier = String(filter).toLowerCase();
    if (typeof filter !== 'object') {
      if (container[lowerCaseIdentifier]) { return [container[lowerCaseIdentifier]]; }
      if (container[filter])              { return [container[filter]];              }
    }

    let itemIds = Object.keys(container);
    for (let i = 0; i < itemIds.length; i++) {
      let itemId = itemIds[i];
      let name = container[itemId].name;
      if (name.toLowerCase() == lowerCaseIdentifier) {
        result.push(container[itemId]);
        continue;
      }
      else if (typeof filter !== "number" && name.search(filter) !== -1) {
        result.push(container[itemId]);
        continue;
      }
      else if (name.toLowerCase().indexOf(lowerCaseIdentifier) !== -1) {
        result.push(container[itemId]);
        continue;
      }

      if (specifics) {
        let specificResult = specifics(container[itemId]);
        if (specificResult) {
          result.push(specificResult);
          continue;
        }
      }
    }
    return result;
  }
}

export function listCache(container) {
  return Object.keys(container).map((itemId) => { return container[itemId]; })
}

export function listCacheItemsInSphereInLocation(container, sphereIds: string[], locationIds: string[], itemIds: string[]) {
  let result = listCache(container);

  result = _filter(result, sphereIds, 'sphereId');
  result = _filter(result, locationIds, 'locationId');
  result = _filter(result, itemIds, 'id');

  return result;
}

export function listCacheItemsInSphere(container, sphereIds: string[], itemIds: string[]) {
  let result = listCache(container);

  result = _filter(result, sphereIds, 'sphereId');
  result = _filter(result, itemIds, 'id');

  return result;
}
export function listCacheItemsInLocation(container, locationIds: string[], itemIds: string[]) {
  let result = listCache(container);

  result = _filter(result, locationIds, 'locationId');
  result = _filter(result, itemIds, 'id');

  return result;
}
export function listCacheItems(container, itemIds: string[]) {
  let result = listCache(container);
  result = _filter(result, itemIds, 'id');
  return result;
}

function _filter(itemArray, idArray: string[], field) {
  if (idArray.length === 0) {
    return itemArray;
  }

  return itemArray.filter((item) => { return idArray.indexOf(item[field]) !== -1 })
}


export function gotAllInSphere(cache : CacheStorage, sphereId, type : "crownstones" | "locations" | "users") {
  if (cache.downloadedAllInSphere[sphereId] === undefined) {
    cache.downloadedAllInSphere[sphereId] = {crownstones: false, locations: false, users: false};
  }
  cache.downloadedAllInSphere[sphereId][type] = true;
}