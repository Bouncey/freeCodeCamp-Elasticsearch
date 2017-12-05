const path = require('path');
const svn = require('node-svn-ultimate');
const fse = require('fs-extra');
const matter = require( 'gray-matter');
const { Observable } = require( 'rx');
const { bulkInsert } = require( '../../elastic');
const { log, readDir } = require( '../../utils');
const logger = log('news');
const viewMap = fse.readFileSync(path.resolve(__dirname, './views.txt'), 'utf8')
  .split('\n')
  .reduce((accu, current) => {
    const [ url, count ] = current.split(', ');
    const key = url.split('/').slice(-1);
    return {
      ...accu,
      [key]: parseInt(count, 10)
    };
  }, {});

exports.viewMap = viewMap;

const storiesDir = path.resolve(__dirname, './svn');
let stories = [];
async function buildAndInsert(file) {
  const fileContent = await fse.readFileSync(file, 'utf8');
  const fileData = matter(fileContent);
  const { id } = fileData.data;
  const url = '/' + file.split('/').slice(-1)[0].replace(/\.md$/, '');
  const story = {
    id,
    content: fileData.content,
    data: { ...fileData.data },
    views: id in viewMap ? viewMap[id] : 1,
    newsViews: [],
    url
  };
  stories = [ ...stories, story ];
  if (stories.length >= 150) {
    bulkInsert({ index: 'news', type: 'story', documents: stories.slice(0) });
    stories = [];
  }
  return;
}

exports.getStoryData = async () => {
  fse.remove(storiesDir, (err) => {
    if (err) {
      logger(err.message, 'yellow');
      throw new Error(err.stack);
    }
    svn.commands.checkout(
      'https://github.com/freecodecamp/news/trunk/src/resource/text',
      storiesDir,
      (err) => {
        if (err) {
          logger(err.message, 'red');
          throw new Error(err.stack);
        }
        logger('got stories', 'magenta');
        Observable.zip(
          Observable.timer(0, 750),
          Observable.from(readDir(storiesDir, true)).bufferWithCount(100),
          (a, b) => b
        )
          .flatMap(fileNames => {
            return Observable.from(fileNames.map(name => `${storiesDir}/${name}`));
          })
          .subscribe(
            file => {
              buildAndInsert(file);
            },
            err => {
              logger(err.message, 'yellow');
            },
            () => {
              if (stories.length > 0) {
                bulkInsert({ index: 'news', type: 'story', documents: stories.slice(0) });
                stories = [];
              }
              logger('COMPLETE', 'magenta');
            }
          );
      });
  });
};
