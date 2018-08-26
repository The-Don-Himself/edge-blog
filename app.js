/*jshint esversion: 6 */
/*globals Dom7, Framework7 */

// Change This TO Your Own Domain or Leave Blank For Current Domain
const baseUrl = '';
const apiUrl = baseUrl + '/api';

// Dom7
let $ = Dom7;

let app = new Framework7({
  root: '#app',
  name: 'The Don Himself',
  theme: 'auto',
  init: true,
  view: {
    pushState: true,
    pushStateSeparator: '#',
    pushStateOnLoad: false
  },
  routes: [
    {
      name: 'entries',
      path: '/',
      async: function (routeTo, routeFrom, resolve, reject) {
        resolve(
          {
            templateUrl: './entries.html'
          },
          {
            context: {}
          }
        );
      }
    },
    {
      name: 'entry',
      path: '/entries/:entryId',
      async: function (routeTo, routeFrom, resolve, reject) {
        preloaderShow();

        let params = routeTo.params;
        let entry_id = params.entryId;

        fetch(apiUrl + '/entries/' + entry_id + '.json', {
          method: 'GET'
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          preloaderHide();

          resolve(
            {
              templateUrl: './entry.html'
            },
            {
              context: {
                entry: data
              }
            }
          );
        })
        .catch(function(err) {
          toastShow('This route could not be loaded, please try again later.');
          preloaderHide();

          console.log('Fetch Error :-S', err);
          reject();
        });
      }
    },
    // Default route, match to all pages (e.g. 404 page)
    {
      path: '(.*)',
      async: function (routeTo, routeFrom, resolve, reject) {
        resolve(
          {
            templateUrl: './404.html'
          },
          {
            context: {}
          }
        );
      }
    }
  ],
  on: {
    routerAjaxStart: function () {
      preloaderShow();
    },
    routerAjaxError: function () {
      toastShow('This route could not be loaded, please try again later.');
    },
    routerAjaxComplete: function () {
      preloaderHide();
    }
  }
});

function preloaderShow() {
  app.preloader.show();
}

function toastShow(message) {
  app.toast.create({
    text: message,
    closeTimeout: 5000
  }).open();
}

function preloaderHide() {
  app.preloader.hide();
}

function loadEntries() {
  preloaderShow();

  fetch(apiUrl + '/entries.json', {
    method: 'GET'
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    preloaderHide();

    app.virtualList.create({
      el: '.virtual-list',
      items: data,
      searchAll: function (query, items) {
        let found = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
        }
        return found;
      },
      itemTemplate:
        '<li>' +
          '<div class="card demo-facebook-card">' +
            '<div class="card-header">' +
              '<div class="demo-facebook-avatar"><i class="f7-icons">&#9617;</i></div>' +
              '<div class="demo-facebook-name">{{ title }}</div>' +
              '<div class="demo-facebook-date">{{ date }}</div>' +
            '</div>' +
            '{{#if image}}' +
              '<div class="card-content">' +
                '<img src="{{ image }}" width="100%"/>' +
              '</div>' +
            '{{/if}}' +
            '<div class="card-content card-content-padding">' +
              '<p>' +
                  '{{ description }}' +
              '</p>' +
            '</div>' +
            '<div class="card-footer">' +
              '<a href="/entries/{{ id }}">' +
                '<div class="chip">' +
                  '<div class="chip-media bg-color-blue">' +
                    '<i class="f7-icons">&#x000AB;</i>' +
                  '</div>' +
                  '<div class="chip-label">Read More</div>' +
                '</div>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</li>',
      height: app.theme === 'ios' ? 63 : 73,
    });
  })
  .catch(function(err) {
    toastShow('Sorry, we could not load those entries, please refresh the page and try again later.');
    preloaderHide();

    console.log('Fetch Error :-S', err);
  });
}

$(document).on('page:afterin', '.page[data-name="entries"]', function (e) {
  loadEntries();
});

function initializeApp() {
  let parsedUrl = new URL(window.location.href);
  let hash = parsedUrl.hash;

  let nextUrl;
  if(hash){
    nextUrl = hash.substr(1);
    if(nextUrl == '/'){
      loadEntries();
    } else {
      app.router.navigate(nextUrl);
    }
  } else {
    loadEntries();
  }
}

initializeApp();