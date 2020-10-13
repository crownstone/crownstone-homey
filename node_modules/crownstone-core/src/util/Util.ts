export const Util = {

  boundToUnity: function(value) {
    return Math.min(1,Math.max(value,0));
  },

  bound0_100: function(value) {
    return Util.boundToUnity(value) * 100;
  },

  getBitMaskUInt8: function(value) {
    const result = Array(8).fill(false);
    let one = 1;
    result[0] = (value & one) != 0;
    result[1] = (value & (one << 1)) != 0;
    result[2] = (value & (one << 2)) != 0;
    result[3] = (value & (one << 3)) != 0;
    result[4] = (value & (one << 4)) != 0;
    result[5] = (value & (one << 5)) != 0;
    result[6] = (value & (one << 6)) != 0;
    result[7] = (value & (one << 7)) != 0;
    return result
  },

  getBitMaskUInt32: function(value) {
    const result = Array(32).fill(false);
    let one = 1;

    for (let i = 0; i < 32; i++) {
      result[i] = (value & (one << i)) != 0;
    }

    return result;
  },

  UInt32FromBitmask : function(bitMask) {
    let result = 0;
    let one = 1;

    for (let i = 0; i < 32; i++) {
      if (bitMask[i]) {
        result = (result | (one << i))
      }
    }

    return result
  },

  pad: function(str) {
    if (Number(str) < 10) {
      return '0' + str;
    }
    return str;
  },

  getDateHourId: function(timestamp)  {
    if (timestamp === 0) {
      return 'unknown';
    }
    let date = new Date(timestamp);
    let month = Util.pad(date.getMonth() + 1);
    let day = Util.pad(date.getDate());
    let hours = Util.pad(date.getHours());

    return date.getFullYear() + '/' + month + '/' + day + ' ' + hours + ':00:00'
  },

  getDateFormat: function(timestamp)  {
    if (timestamp === 0) {
      return 'unknown';
    }
    let date = new Date(timestamp);
    let month = Util.pad(date.getMonth() + 1);
    let day = Util.pad(date.getDate());

    return date.getFullYear() + '/' + month + '/' + day
  },

  getDateTimeFormat: function(timestamp)  {
    if (timestamp === 0) {
      return 'unknown';
    }
    let date = new Date(timestamp);

    let month = Util.pad(date.getMonth() + 1);
    let day = Util.pad(date.getDate());
    let hours = Util.pad(date.getHours());
    let minutes = Util.pad(date.getMinutes());
    let seconds = Util.pad(date.getSeconds());

    return date.getFullYear() + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds
  },

  getTimeFormat: function(timestamp, showSeconds = true)  {
    if (timestamp === 0) {
      return 'unknown';
    }

    let date = new Date(timestamp);

    let hours = date.getHours();
    let minutes = Util.pad(date.getMinutes());

    if (showSeconds === false) {
      return hours + ':' + minutes;
    }

    let seconds = Util.pad(date.getSeconds());

    return hours + ':' + minutes + ':' + seconds
  },

  getToken : () : string => {
    return Math.floor(Math.random() * 1e8 /* 65536 */).toString(36);
  },


  mixin: function(base, section, context) {
    for (let key in section) {
      if (section.hasOwnProperty(key)) {
        if (typeof section[key] === 'function') {
          base[key] = section[key].bind(context)
        }
        else {
          base[key] = section[key]
        }
      }
    }
  },

  spreadString: function(string) {
    let result = '';
    for (let i = 0; i < string.length; i++) {
      result += string[i];
      if (i !== (string.length-1) && string[i] !== ' ') {
        result += ' '
      }

      if (string[i] === ' ') {
        result += '   ';
      }
    }
    return result;
  },


  getUUID : () : string => {
    return (
      S4() + S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + S4() + S4()
    );
  },

  getShortUUID : () : string => {
    return (
      S4() + S4() + '-' +
      S4()
    );
  },



  getDelayLabel: function(delay, fullLengthText = false) {
    if (delay < 60) {
      return Math.floor(delay) + ' seconds';
    }
    else {
      if (fullLengthText === true) {
        return Math.floor(delay / 60) + ' minutes';
      }
      else {
        return Math.floor(delay / 60) + ' min';
      }
    }
  },

  crownstoneTimeToTimestamp: function(csTimestamp) : number {
    let now = Date.now();
    if ((now / csTimestamp) < 10) {
      csTimestamp = csTimestamp / 1000;
    }
    let jsTimestamp = 1000*csTimestamp;
    let timezoneOffsetMinutes = new Date(jsTimestamp).getTimezoneOffset();

    return jsTimestamp + timezoneOffsetMinutes*60000;
  },

  timestampToCrownstoneTime: function(utcTimestamp) : number {
    // for holland in summer, timezoneOffsetMinutes is -120, winter will be -60
    let timezoneOffsetMinutes = new Date(utcTimestamp).getTimezoneOffset();

    return (utcTimestamp - timezoneOffsetMinutes*60000)/1000;
  },

  nowToCrownstoneTime: function() : number {
    return Util.timestampToCrownstoneTime(Date.now())
  },

  versions: {
    isHigher: function(version, compareWithVersion) {
      if (!version || !compareWithVersion) {
        return false;
      }

      let [versionClean, versionRc] = getRC(version);
      let [compareWithVersionClean, compareWithVersionRc] = getRC(compareWithVersion);

      if (checkSemVer(versionClean) === false || checkSemVer(compareWithVersionClean) === false) {
        return false;
      }

      let A = versionClean.split('.');
      let B = compareWithVersionClean.split('.');

      if (A[0] < B[0]) return false;
      else if (A[0] > B[0]) return true;
      else { // A[0] == B[0]
        if (A[1] < B[1]) return false;
        else if (A[1] > B[1]) return true;
        else { // A[1] == B[1]
          if (A[2] < B[2]) return false;
          else if (A[2] > B[2]) return true;
          else { // A[2] == B[2]
            if (versionRc === null && compareWithVersionRc === null) {
              return false;
            }
            else if (versionRc !== null && compareWithVersionRc !== null) {
              return (versionRc > compareWithVersionRc);
            }
            else if (versionRc !== null) {
              // 2.0.0.rc0 is smaller than 2.0.0
              return false;
            }
            else {
              return true;
            }
          }
        }
      }
    },


    /**
     * This is the same as the isHigherOrEqual except it allows access to githashes. It is up to the dev to determine what it can and cannot do.
     * @param myVersion
     * @param minimumRequiredVersion
     * @returns {any}
     */
    canIUse: function(myVersion, minimumRequiredVersion) {
      if (!myVersion)              { return false; }
      if (!minimumRequiredVersion) { return false; }

      let [myVersionClean, myVersionRc] = getRC(myVersion);
      let [minimumRequiredVersionClean, minimumRequiredVersionRc] = getRC(minimumRequiredVersion);

      if (checkSemVer(myVersionClean) === false) {
        return true;
      }

      return Util.versions.isHigherOrEqual(myVersionClean, minimumRequiredVersionClean);
    },

    isHigherOrEqual: function(version, compareWithVersion) {
      if (!version || !compareWithVersion) {
        return false;
      }

      let [versionClean, versionRc] = getRC(version);
      let [compareWithVersionClean, compareWithVersionRc] = getRC(compareWithVersion);

      if (checkSemVer(versionClean) === false || checkSemVer(compareWithVersionClean) === false) {
        return false;
      }

      if (version === compareWithVersion && version && compareWithVersion) {
        return true;
      }

      if (versionClean === compareWithVersionClean && versionClean && compareWithVersionClean && versionRc === compareWithVersionRc) {
        return true;
      }

      return Util.versions.isHigher(version, compareWithVersion);
    },

    isLower: function(version, compareWithVersion) {
      if (!version || !compareWithVersion) {
        return false;
      }

      let [versionClean, versionRc] = getRC(version);
      let [compareWithVersionClean, compareWithVersionRc] = getRC(compareWithVersion);

      if (checkSemVer(versionClean) === false || checkSemVer(compareWithVersionClean) === false) {
        return false;
      }

      // Do not allow compareWithVersion to be semver
      if (compareWithVersionClean.split(".").length !== 3) {
        return false;
      }

      // if version is NOT semver, is higher will be false so is lower is true.
      return !Util.versions.isHigherOrEqual(version, compareWithVersion);
    },
  },


  deepCopy(object) {
    return Util.deepExtend({}, object);
  },

  deepExtend: function (a, b, protoExtend = false, allowDeletion = false) {
    for (let prop in b) {
      if (b.hasOwnProperty(prop) || protoExtend === true) {
        if (b[prop] && b[prop].constructor === Object) {
          if (a[prop] === undefined) {
            a[prop] = {};
          }
          if (a[prop].constructor === Object) {
            Util.deepExtend(a[prop], b[prop], protoExtend);
          }
          else {
            if ((b[prop] === null) && a[prop] !== undefined && allowDeletion === true) {
              delete a[prop];
            }
            else {
              a[prop] = b[prop];
            }
          }
        }
        else if (Array.isArray(b[prop])) {
          a[prop] = [];
          for (let i = 0; i < b[prop].length; i++) {
            if (b[prop][i] && b[prop][i].constructor === Object) {
              a[prop].push(Util.deepExtend({},b[prop][i]));
            }
            else {
              a[prop].push(b[prop][i]);
            }
          }
        }
        else {
          if ((b[prop] === null) && a[prop] !== undefined && allowDeletion === true) {
            delete a[prop];
          }
          else {
            a[prop] = b[prop];
          }
        }
      }
    }
    return a;
  },

  deepCompare: function (a, b, d=0) {
    let iterated = false;
    for (let prop in b) {
      iterated = true;
      if (b.hasOwnProperty(prop)) {
        if (a[prop] === undefined) {
          return false;
        }
        else if (b[prop] && !a[prop] || a[prop] && !b[prop]) {
          return false;
        }
        else if (!b[prop] && !a[prop] && a[prop] != b[prop]) {
          return false;
        }
        else if (!b[prop] && !a[prop] && a[prop] == b[prop]) {
          continue;
        }
        else if (b[prop].constructor === Object) {
          if (a[prop].constructor === Object) {
            if (Util.deepCompare(a[prop], b[prop], d+1) === false) {
              return false
            }
          }
          else {
            return false;
          }
        }
        else if (Array.isArray(b[prop])) {
          if (Array.isArray(a[prop]) === false) {
            return false;
          }
          else if (a[prop].length !== b[prop].length) {
            return false;
          }

          for (let i = 0; i < b[prop].length; i++) {
            if (Util.deepCompare(a[prop][i], b[prop][i]) === false) {
              return false;
            }
          }
        }
        else {
          if (a[prop] !== b[prop]) {
            return false;
          }
        }
      }
    }

    if (!iterated) {
      return a === b;
    }

    return true;
  },

  promiseBatchPerformer: function(arr : any[], method : PromiseCallback) : Promise<void> {
    if (arr.length === 0) {
      return new Promise((resolve, reject) => { resolve() });
    }
    return Util._promiseBatchPerformer(arr, 0, method);
  },

  _promiseBatchPerformer: function(arr : any[], index : number, method : PromiseCallback) : Promise<void>  {
    return new Promise((resolve, reject) => {
      if (index < arr.length) {
        method(arr[index])
          .then(() => {
            return Util._promiseBatchPerformer(arr, index+1, method);
          })
          .then(() => {
            resolve()
          })
          .catch((err) => reject(err))
      }
      else {
        resolve();
      }
    })
  },

  capitalize: function(inputStr: string) {
    if (!inputStr) { return "" }

    return inputStr[0].toUpperCase() + inputStr.substr(1)
  },

  stringify: function(obj, space = 2) {
    let allKeys = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space);
  },



  wait: function(waitTimeMs : number) : Promise<void> {
    return new Promise(function(resolve, reject) {
      setTimeout(function() { resolve() }, waitTimeMs)
    })
  },

  prepareKey(key: string | Buffer) {
    if (!key) { return Buffer.alloc(16) }

    if (key instanceof Buffer) {
      return key;
    }

    if (key.length === 16) {
      return Buffer.from(key, 'ascii');
    }
    else if (key.length === 32) {
      return Buffer.from(key, 'hex')
    }
    else {
      throw "Invalid Key: " + key;
    }
  }

};


const S4 = function () {
  return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
};


function getRC(version) {
  let lowerCaseVersion = version.toLowerCase();
  let lowerCaseRC_split = lowerCaseVersion.split("-rc");
  let RC = null;
  if (lowerCaseRC_split.length > 1) {
    RC = lowerCaseRC_split[1];
  }

  return [lowerCaseRC_split[0], RC];
}

let checkSemVer = (str) => {
  if (!str) { return false; }

  // a git commit hash is longer than 12, we pick 12 so 123.122.1234 is the max semver length.
  if (str.length > 12) {
    return false;
  }

  let A = str.split('.');

  // further ensure only semver is compared
  if (A.length !== 3) {
    return false;
  }

  return true;
};