import sourceMap from 'source-map-support';
sourceMap.install();

import pify from 'pify';
import fs from 'fs';
import JSON5 from 'json5';
import { CronJob } from 'cron';
import fetch from 'node-fetch';
import { load as cheerio } from 'cheerio';
import Twit from 'twit';
import { parseString as xml2js } from 'xml2js';
import sleep from 'sleep-promise';
import URI from 'uri-js';

let inProcessing = false;
let lastFetched = new Date();

let config = JSON5.parse(fs.readFileSync('./settings.json5'));
let twit = new Twit(config);

let main = async function() {
  let fetchingTime = new Date();

  let res = await fetch('http://3846masa-stock.tumblr.com/rss');
  if (!res.ok) return;
  let feed = await pify(xml2js)(await res.text());

  let items =
    feed.rss.channel[0].item
    .map(xmlNormalize)
    .filter((i) => lastFetched < Date.parse(i.pubDate));

  for (let item of items) {
    await tweetItem(item);
  }

  lastFetched = fetchingTime;
};

let tweetItem = async function(item) {
  let $ = cheerio(item.description);
  let href = $('a').eq(0).attr('href');
  let link = URI.serialize(URI.parse(href));
  let title =
    (item.title.length > 100) ? item.title.substr(0, 100) + '...' : item.title;
  let tweetText = `[Stocked]\n${title}\n${link}`;

  await pify(twit.post).call(twit, 'statuses/update', {
    status: tweetText
  });
};

let xmlNormalize = function(item) {
  for (let key in item) {
    if (item[key].length > 1) continue;
    item[key] = item[key][0];
  }
  return item;
};

new CronJob({
  cronTime: '* * * * * *',
  onTick: function() {
    if (inProcessing) return;
    inProcessing = true;

    Promise.all([
      main(),
      sleep(config.wait_sec * 1000)
    ])
    .catch((err) => {
      console.error(err.stack || err);
      lastFetched = new Date();
      return sleep(config.wait_sec * 1000);
    })
    .then(() => inProcessing = false);
  }
}).start();
