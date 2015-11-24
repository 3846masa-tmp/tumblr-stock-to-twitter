'use strict';

var _co = require('co');

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _json = require('json5');

var _json2 = _interopRequireDefault(_json);

var _cron = require('cron');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _cheerio = require('cheerio');

var _twit = require('twit');

var _twit2 = _interopRequireDefault(_twit);

var _xml2js = require('xml2js');

var _sleepPromise = require('sleep-promise');

var _sleepPromise2 = _interopRequireDefault(_sleepPromise);

var _uriJs = require('uri-js');

var _uriJs2 = _interopRequireDefault(_uriJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sourceMapSupport2.default.install();

let inProcessing = false;
let lastFetched = new Date();

let config = _json2.default.parse(_fs2.default.readFileSync('./settings.json5'));
let twit = new _twit2.default(config);

let main = (function () {
  var ref = (0, _co.wrap)(function* () {
    let fetchingTime = new Date();

    let res = yield (0, _nodeFetch2.default)('http://3846masa-stock.tumblr.com/rss');
    if (!res.ok) return;
    let feed = yield (0, _pify2.default)(_xml2js.parseString)((yield res.text()));

    let items = feed.rss.channel[0].item.map(xmlNormalize).filter(i => lastFetched < Date.parse(i.pubDate));

    for (let item of items) {
      yield tweetItem(item);
    }

    lastFetched = fetchingTime;
  });
  return function main() {
    return ref.apply(this, arguments);
  };
})();

let tweetItem = (function () {
  var ref = (0, _co.wrap)(function* (item) {
    let $ = (0, _cheerio.load)(item.description);
    let href = $('a').eq(0).attr('href');
    let link = _uriJs2.default.serialize(_uriJs2.default.parse(href));
    let title = item.title.length > 100 ? item.title.substr(0, 100) + '...' : item.title;
    let tweetText = `[Stocked]\n${ title }\n${ link }`;

    yield (0, _pify2.default)(twit.post).call(twit, 'statuses/update', {
      status: tweetText
    });
  });
  return function tweetItem(_x) {
    return ref.apply(this, arguments);
  };
})();

let xmlNormalize = function xmlNormalize(item) {
  for (let key in item) {
    if (item[key].length > 1) continue;
    item[key] = item[key][0];
  }
  return item;
};

new _cron.CronJob({
  cronTime: '* * * * * *',
  onTick: function onTick() {
    if (inProcessing) return;
    inProcessing = true;

    Promise.all([main(), (0, _sleepPromise2.default)(config.wait_sec * 1000)]).catch(err => {
      console.error(err.stack || err);
      lastFetched = new Date();
      return (0, _sleepPromise2.default)(config.wait_sec * 1000);
    }).then(() => inProcessing = false);
  }
}).start();
//# sourceMappingURL=data:application/json;base64,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LENBc0RKO0FBQ1YsVUFBUSxFQUFFLGFBQWE7QUFDdkIsUUFBTSxFQUFFLGtCQUFXO0FBQ2pCLFFBQUksWUFBWSxFQUFFLE9BQU87QUFDekIsZ0JBQVksR0FBRyxJQUFJLENBQUM7O0FBRXBCLFdBQU8sQ0FBQyxHQUFHLENBQUMsQ0FDVixJQUFJLEVBQUUsRUFDTiw0QkFBTSxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUM5QixDQUFDLENBQ0QsS0FBSyxDQUFDLEFBQUMsR0FBRyxJQUFLO0FBQ2QsYUFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLGlCQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN6QixhQUFPLDRCQUFNLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDdEMsQ0FBQyxDQUNELElBQUksQ0FBQyxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQztHQUNuQztDQUNGLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VyY2VNYXAgZnJvbSAnc291cmNlLW1hcC1zdXBwb3J0JztcbnNvdXJjZU1hcC5pbnN0YWxsKCk7XG5cbmltcG9ydCBwaWZ5IGZyb20gJ3BpZnknO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBKU09ONSBmcm9tICdqc29uNSc7XG5pbXBvcnQgeyBDcm9uSm9iIH0gZnJvbSAnY3Jvbic7XG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5pbXBvcnQgeyBsb2FkIGFzIGNoZWVyaW8gfSBmcm9tICdjaGVlcmlvJztcbmltcG9ydCBUd2l0IGZyb20gJ3R3aXQnO1xuaW1wb3J0IHsgcGFyc2VTdHJpbmcgYXMgeG1sMmpzIH0gZnJvbSAneG1sMmpzJztcbmltcG9ydCBzbGVlcCBmcm9tICdzbGVlcC1wcm9taXNlJztcbmltcG9ydCBVUkkgZnJvbSAndXJpLWpzJztcblxubGV0IGluUHJvY2Vzc2luZyA9IGZhbHNlO1xubGV0IGxhc3RGZXRjaGVkID0gbmV3IERhdGUoKTtcblxubGV0IGNvbmZpZyA9IEpTT041LnBhcnNlKGZzLnJlYWRGaWxlU3luYygnLi9zZXR0aW5ncy5qc29uNScpKTtcbmxldCB0d2l0ID0gbmV3IFR3aXQoY29uZmlnKTtcblxubGV0IG1haW4gPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgbGV0IGZldGNoaW5nVGltZSA9IG5ldyBEYXRlKCk7XG5cbiAgbGV0IHJlcyA9IGF3YWl0IGZldGNoKCdodHRwOi8vMzg0Nm1hc2Etc3RvY2sudHVtYmxyLmNvbS9yc3MnKTtcbiAgaWYgKCFyZXMub2spIHJldHVybjtcbiAgbGV0IGZlZWQgPSBhd2FpdCBwaWZ5KHhtbDJqcykoYXdhaXQgcmVzLnRleHQoKSk7XG5cbiAgbGV0IGl0ZW1zID1cbiAgICBmZWVkLnJzcy5jaGFubmVsWzBdLml0ZW1cbiAgICAubWFwKHhtbE5vcm1hbGl6ZSlcbiAgICAuZmlsdGVyKChpKSA9PiBsYXN0RmV0Y2hlZCA8IERhdGUucGFyc2UoaS5wdWJEYXRlKSk7XG5cbiAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xuICAgIGF3YWl0IHR3ZWV0SXRlbShpdGVtKTtcbiAgfVxuXG4gIGxhc3RGZXRjaGVkID0gZmV0Y2hpbmdUaW1lO1xufTtcblxubGV0IHR3ZWV0SXRlbSA9IGFzeW5jIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgbGV0ICQgPSBjaGVlcmlvKGl0ZW0uZGVzY3JpcHRpb24pO1xuICBsZXQgaHJlZiA9ICQoJ2EnKS5lcSgwKS5hdHRyKCdocmVmJyk7XG4gIGxldCBsaW5rID0gVVJJLnNlcmlhbGl6ZShVUkkucGFyc2UoaHJlZikpO1xuICBsZXQgdGl0bGUgPVxuICAgIChpdGVtLnRpdGxlLmxlbmd0aCA+IDEwMCkgPyBpdGVtLnRpdGxlLnN1YnN0cigwLCAxMDApICsgJy4uLicgOiBpdGVtLnRpdGxlO1xuICBsZXQgdHdlZXRUZXh0ID0gYFtTdG9ja2VkXVxcbiR7dGl0bGV9XFxuJHtsaW5rfWA7XG5cbiAgYXdhaXQgcGlmeSh0d2l0LnBvc3QpLmNhbGwodHdpdCwgJ3N0YXR1c2VzL3VwZGF0ZScsIHtcbiAgICBzdGF0dXM6IHR3ZWV0VGV4dFxuICB9KTtcbn07XG5cbmxldCB4bWxOb3JtYWxpemUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGZvciAobGV0IGtleSBpbiBpdGVtKSB7XG4gICAgaWYgKGl0ZW1ba2V5XS5sZW5ndGggPiAxKSBjb250aW51ZTtcbiAgICBpdGVtW2tleV0gPSBpdGVtW2tleV1bMF07XG4gIH1cbiAgcmV0dXJuIGl0ZW07XG59O1xuXG5uZXcgQ3JvbkpvYih7XG4gIGNyb25UaW1lOiAnKiAqICogKiAqIConLFxuICBvblRpY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChpblByb2Nlc3NpbmcpIHJldHVybjtcbiAgICBpblByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgbWFpbigpLFxuICAgICAgc2xlZXAoY29uZmlnLndhaXRfc2VjICogMTAwMClcbiAgICBdKVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGVyci5zdGFjayB8fCBlcnIpO1xuICAgICAgbGFzdEZldGNoZWQgPSBuZXcgRGF0ZSgpO1xuICAgICAgcmV0dXJuIHNsZWVwKGNvbmZpZy53YWl0X3NlYyAqIDEwMDApO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4gaW5Qcm9jZXNzaW5nID0gZmFsc2UpO1xuICB9XG59KS5zdGFydCgpO1xuIl19