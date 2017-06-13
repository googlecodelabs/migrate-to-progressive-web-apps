// Copyright 2017 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function urlB64ToUint8Array(base64String) {
  const suffixLength = 4 - base64String.length % 4;
  const base64 = (base64String + '='.repeat(suffixLength))
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  const raw = window.atob(base64);

  const output = new Uint8Array(raw.length);
  Array.from(raw).forEach((c, i) => output[i] = c.charCodeAt(0));
  return output;
}

function stringToBase64Url(s) {
  const base64 = window.btoa(s);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

function JSONToBase64Url(data) {
  const s = JSON.stringify(data);
  return stringToBase64Url(s);
}

function uint8ArrayToBase64Url(array) {
  const s = String.fromCodePoint(...array);
  return stringToBase64Url(s);
}

/**
 * @param {string} publicKey public key in URL-safe base64
 * @param {string} privateKey private key in URL-safe base64
 * @param {string} endpoint from PushSubscription
 * @param {string} sender either "mailto:<email>" or a web address
 * @return {!Promise<string>} the Authorization header
 */
function prepareAuthorization(publicKey, privateKey, endpoint, sender) {
  const origin = new URL(endpoint).origin;
  const defaultExpiration = Math.floor(Date.now() / 1000) + 43200;  // 12 hours in future

  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  const jwtPayload = {
    aud: origin,
    exp: defaultExpiration,
    sub: sender,
  };

  // unsignedToken is the URL-safe base64 encoded JSON header and body joined by a dot.
  const unsignedToken = JSONToBase64Url(header) + '.' + JSONToBase64Url(jwtPayload);

  // Sign unsignedToken using ES256 (SHA-256 over ECDSA). This requires the private key.
  const publicKeyArray = urlB64ToUint8Array(publicKey);
  const key = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64Url(publicKeyArray.subarray(1, 33)),
    y: uint8ArrayToBase64Url(publicKeyArray.subarray(33, 65)),
    d: privateKey,
  };

  // Perform the signing. importKey returns a Promise, so wait for it to finish.
  const args = {name: 'ECDSA', namedCurve: 'P-256'};
  return crypto.subtle.importKey('jwk', key, args, true, ['sign'])
      .then(key => {
        return crypto.subtle.sign({
          name: 'ECDSA',
          hash: {
            name: 'SHA-256',
          },
        }, key, (new TextEncoder('utf-8')).encode(unsignedToken));
      })
      .then(buffer => new Uint8Array(buffer))
      .then(signature => {
        return 'WebPush ' + unsignedToken + '.' + uint8ArrayToBase64Url(signature);
      });
}