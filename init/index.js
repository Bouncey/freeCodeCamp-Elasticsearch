const path = require('path');
const envPath = path.resolve(__dirname, '../.env');

require('dotenv').config({ path: envPath });

const { Observable } = require('rx');
const { getStoryData } = require('./news');
const getYoutubeData = require('./youtube');
const getChallengeData = require('./challenges');
const getGuideArticleData = require('./guides');
const { deleteAll } = require('../elastic');

const dataSources = [
  getGuideArticleData,
  getYoutubeData,
  getChallengeData,
  // disable this until the roll out of news
  // getStoryData
];

function init() {
  deleteAll()
  .then(() => {
    Observable.zip(
      Observable.timer(0, 2000),
      Observable.from(dataSources),
      (a, b) => b
      )
      .subscribe(fn => {
        fn();
      });
  });
}

init();
