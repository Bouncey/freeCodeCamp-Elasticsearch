const Rx = require('rx');
const request = require('request');

const {
  bulkInsert
} = require('../../elastic');
const { log } = require('../../utils');

const logger = log('youtube');

const { Observable } = Rx;
const { YOUTUBE_SECRET } = process.env;


function getFromApi(path, page) {
  const pageToken = page ? `&pageToken=${page}` : '';
  const url = `https://www.googleapis.com/youtube/v3/${path}&part=snippet&key=${YOUTUBE_SECRET}${pageToken}`;
  const options = {
    url
  };
  return new Promise((resolve, reject) => {
    request.get(options, (err, res, body) => {
      if (err) {
        reject(err);
      }
      const response = JSON.parse(body);
      resolve(response);
    });
  });
}

function getPlayLists(page) {
  const playListsPath = 'playlists?channelId=UC8butISFwT-Wl7EV0hUK0BQ';
  return Observable.fromPromise(getFromApi(playListsPath, page));
}

function getYoutubeData(page, update) {
  getPlayLists(page)
    .subscribe(
      ({ items, nextPageToken }) => {
        Observable.from(items)
          .subscribe(
            ({ id }) => {
              getPlayListItems('', id, update);
            }
          );
        if (nextPageToken) {
          getYoutubeData(nextPageToken, update);
        }
      },
      (err) => {
        logger(`Error from getPlayLists: ${err.message}`, 'red');
      }
    );
}

function getPlayListItems(page, id, update) {
  const playListItemsPath = `playlistItems?playlistId=${id}`;
  return Observable.fromPromise(getFromApi(playListItemsPath, page))
    .subscribe(
      ({ items, nextPageToken }) => {
        const formattedItems = items
          .map(item => {
            let {
              snippet: {
                title,
                description,
                // some videos do not have thumbnails
                thumbnails: { standard: thumbnail = {} } = {},
                resourceId: { videoId }
              }
            } = item;
            return {
              title,
              description,
              thumbnail,
              videoId,
              url: `https://www.youtube.com/watch?v=${videoId}`
            };
          });

        bulkInsert({index: 'youtube', type: 'videos', documents: formattedItems });

        if (nextPageToken) {
          getPlayListItems(nextPageToken, items[0].snippet.playlistId, update);
        } else {
          logger('COMPLETE');
        }
      },
      (err) => {
        logger('getPlayListItems Error: ' + err.message, 'red');
      },
    );
}

module.exports = getYoutubeData;