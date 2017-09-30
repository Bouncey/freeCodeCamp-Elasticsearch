const masterMergedPR  = {
  action: 'closed',
  pull_request: {
    base: {
      ref: 'master'
    },
    merged: true
  }
};

const masterNotMergedPR  = {
  action: 'closed',
  pull_request: {
    base: {
      ref: 'master'
    },
    merged: false
  }
};

const masterPROpen  = {
  action: 'open',
  pull_request: {
    base: {
      ref: 'master'
    },
    merged: false
  }
};

const notMasterMergedPR  = {
  action: 'closed',
  pull_request: {
    base: {
      ref: 'some-other-branch'
    },
    merged: true
  }
};

module.exports = {
  masterMergedPR,
  masterNotMergedPR,
  masterPROpen,
  notMasterMergedPR
};