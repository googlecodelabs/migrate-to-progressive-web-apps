// Copyright 2016 Google Inc.
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

function refresh(action, callback) {
  var x = new XMLHttpRequest();
  x.onload = function() {
    var out = x.response;
    if (typeof out == 'string') {
      out = JSON.parse(out);
    }
    callback(out);
  };
  x.onerror = function() {
    alert('couldn\'t fetch dragon status');
  };

  if (action) {
    x.open('POST', 'https://dragon-server.appspot.com/?action=' + action);
  } else {
    x.open('GET', 'https://dragon-server.appspot.com/');
  }

  x.send();
}

window.addEventListener('load', function() {
  function createDataRow(name, value) {
    var row = document.createElement('tr');

    var th = document.createElement('th');
    th.textContent = name;
    row.appendChild(th);

    var td = document.createElement('td');
    td.textContent = value;
    row.appendChild(td);

    return row;
  }

  var timeout;
  (function work(action) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(work, 60 * 1000);  // 60s

    if (action) {  // clicked action, clear future actions
      actions.textContent = '';
    }
    refresh(action, function(status) {

      gold.textContent = '';
      for (var i = 0; i < status.Gold; ++i) {
        var coin = document.createElement('span');
        coin.className = 'coin';
        coin.style.top = Math.random() * 100 + '%';
        coin.style.left = Math.random() * 100 + '%';
        gold.appendChild(coin);
      }

      data.textContent = '';
      data.appendChild(createDataRow('Gold', status.Gold));
      data.appendChild(createDataRow('Size', status.Size + 'kg'));

      // TODO: update size

      actions.textContent = '';
      status.Actions.forEach(function(action) {
        var button = document.createElement('button');
        button.addEventListener('click', function(ev) {
          ev.preventDefault();
          work(action.ID);
        });
        button.textContent = action.Name;
        actions.appendChild(button);
      });

    });

  }());
});