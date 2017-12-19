const articleMetaRE = /^\-\-\-[\w\W]+?\-\-\-/;
const mdImageRE = /!\[[\w\W]*?\]\([\w\W]+?\)/;
const titleRE = /^#[^\n]*$/gm;
const htmlTagsRE = /(<([^>]+)>)/gi;

function formatExMdownFile(description) {
  return description
      .replace(articleMetaRE, '')
      .replace(htmlTagsRE, '')
      .replace(mdImageRE, '')
      .replace(titleRE, '');
}

function challengeNormaliser(doc) {
  return {
    ...doc,
    friendlySearchString: doc.description.replace(htmlTagsRE, '')
  };
}

function newsNormaliser(doc) {
  return {
    ...doc,
    friendlySearchString: formatExMdownFile(doc.content),
    title: doc.data.title
  };
}

function guideNormaliser(doc) {
  return {
    ...doc,
    friendlySearchString: formatExMdownFile(doc.body),
    url: `https://guide.freecodecamp.org${doc.url}`
  };
}

function youtubeNormaliser(doc) {
  return {
    ...doc,
    friendlySearchString: doc.description
  };
}

const normaliserMap = {
  challenge: challengeNormaliser,
  news: newsNormaliser,
  guides: guideNormaliser,
  youtube: youtubeNormaliser
};

exports.normaliser = function normaliser(index, docs) {
  return docs.map(doc => {
    if (!(index in normaliserMap)) {
      throw new Error('No normalising function found for %s', index);
    }
    return normaliserMap[index](doc);
  });
};
