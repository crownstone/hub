"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const tslib_1 = require("tslib");
const os = tslib_1.__importStar(require("os"));
exports.Util = {
    wait: function (waitTimeMs) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () { resolve(); }, waitTimeMs);
        });
    },
    pad: function (str) {
        if (Number(str) < 10) {
            return '0' + str;
        }
        return str;
    },
    getWeekNumber: function (timestamp) {
        let date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    getDateHourId: function (timestamp) {
        if (timestamp === 0) {
            return 'unknown';
        }
        let date = new Date(timestamp);
        let month = exports.Util.pad(date.getMonth() + 1);
        let day = exports.Util.pad(date.getDate());
        let hours = exports.Util.pad(date.getHours());
        return date.getFullYear() + '/' + month + '/' + day + ' ' + hours + ':00:00';
    },
    getDateFormat: function (timestamp) {
        if (timestamp === 0) {
            return 'unknown';
        }
        let date = new Date(timestamp);
        let month = exports.Util.pad(date.getMonth() + 1);
        let day = exports.Util.pad(date.getDate());
        return date.getFullYear() + '/' + month + '/' + day;
    },
    getDateTimeFormat: function (timestamp) {
        if (timestamp === 0) {
            return 'unknown';
        }
        let date = new Date(timestamp);
        let month = exports.Util.pad(date.getMonth() + 1);
        let day = exports.Util.pad(date.getDate());
        let hours = exports.Util.pad(date.getHours());
        let minutes = exports.Util.pad(date.getMinutes());
        let seconds = exports.Util.pad(date.getSeconds());
        return date.getFullYear() + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    },
    getTimeFormat: function (timestamp, showSeconds = true) {
        if (timestamp === 0) {
            return 'unknown';
        }
        let date = new Date(timestamp);
        let hours = date.getHours();
        let minutes = exports.Util.pad(date.getMinutes());
        if (showSeconds === false) {
            return hours + ':' + minutes;
        }
        let seconds = exports.Util.pad(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    },
    getToken: () => {
        return Math.floor(Math.random() * 1e8 /* 65536 */).toString(36);
    },
    mixin: function (base, section, context) {
        for (let key in section) {
            if (section.hasOwnProperty(key)) {
                if (typeof section[key] === 'function') {
                    base[key] = section[key].bind(context);
                }
                else {
                    base[key] = section[key];
                }
            }
        }
    },
    getUUID: () => {
        return (S4() + S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + S4() + S4());
    },
    getShortUUID: () => {
        return (S4() + S4() + '-' +
            S4());
    },
    versions: {
        isHigher: function (version, compareWithVersion) {
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
            if (A[0] < B[0])
                return false;
            else if (A[0] > B[0])
                return true;
            else { // A[0] == B[0]
                if (A[1] < B[1])
                    return false;
                else if (A[1] > B[1])
                    return true;
                else { // A[1] == B[1]
                    if (A[2] < B[2])
                        return false;
                    else if (A[2] > B[2])
                        return true;
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
        canIUse: function (myVersion, minimumRequiredVersion) {
            if (!myVersion) {
                return false;
            }
            if (!minimumRequiredVersion) {
                return false;
            }
            let [myVersionClean, myVersionRc] = getRC(myVersion);
            let [minimumRequiredVersionClean, minimumRequiredVersionRc] = getRC(minimumRequiredVersion);
            if (checkSemVer(myVersionClean) === false) {
                return true;
            }
            return exports.Util.versions.isHigherOrEqual(myVersionClean, minimumRequiredVersionClean);
        },
        isHigherOrEqual: function (version, compareWithVersion) {
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
            return exports.Util.versions.isHigher(version, compareWithVersion);
        },
        isLower: function (version, compareWithVersion) {
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
            return !exports.Util.versions.isHigherOrEqual(version, compareWithVersion);
        },
    },
    deepCopy(object) {
        return exports.Util.deepExtend({}, object);
    },
    deepExtend: function (a, b, protoExtend = false, allowDeletion = false) {
        for (let prop in b) {
            if (b.hasOwnProperty(prop) || protoExtend === true) {
                if (b[prop] && b[prop].constructor === Object) {
                    if (a[prop] === undefined) {
                        a[prop] = {};
                    }
                    if (a[prop].constructor === Object) {
                        exports.Util.deepExtend(a[prop], b[prop], protoExtend);
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
                            a[prop].push(exports.Util.deepExtend({}, b[prop][i]));
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
    deepCompare: function (a, b, d = 0) {
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
                        if (exports.Util.deepCompare(a[prop], b[prop], d + 1) === false) {
                            return false;
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
                        if (exports.Util.deepCompare(a[prop][i], b[prop][i]) === false) {
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
    promiseBatchPerformer: function (arr, method) {
        if (arr.length === 0) {
            return new Promise((resolve, reject) => { resolve(); });
        }
        return exports.Util._promiseBatchPerformer(arr, 0, method);
    },
    _promiseBatchPerformer: function (arr, index, method) {
        return new Promise((resolve, reject) => {
            if (index < arr.length) {
                method(arr[index])
                    .then(() => {
                    return exports.Util._promiseBatchPerformer(arr, index + 1, method);
                })
                    .then(() => {
                    resolve();
                })
                    .catch((err) => reject(err));
            }
            else {
                resolve();
            }
        });
    },
    capitalize: function (inputStr) {
        if (!inputStr) {
            return "";
        }
        return inputStr[0].toUpperCase() + inputStr.substr(1);
    },
    getLocalIps: function () {
        let ifaces = os.networkInterfaces();
        let localIps = [];
        Object.keys(ifaces).forEach((inter) => {
            // @ts-ignore
            ifaces[inter].forEach((item) => {
                if (item.family === "IPv4" && item.internal === false) {
                    localIps.push(item.address);
                }
            });
        });
        return localIps;
    },
    stripTrailingSlash: function (path) {
        if (path[path.length - 1] === '/') {
            return path.substr(0, path.length - 1);
        }
        return path;
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
function checkSemVer(str) {
    if (!str) {
        return false;
    }
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
}
;
//# sourceMappingURL=Util.js.map