const assert = require('chai').assert;
const should = require('chai').should();
const express = require('express');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const bodyParser = require('body-parser');

const {
  masterMergedPR,
  masterNotMergedPR,
  masterPROpen,
  notMasterMergedPR
} = require('./webhookPayloads');

describe('POST /guides', () => {
  let guideUpdateStub, app, route, request;
  beforeEach(function () {
    guideUpdateStub = sinon.stub();
    app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    route = proxyquire('../webhook-guides', {
      '../../../init/guides': guideUpdateStub
    });
    route(app);
    request = supertest(app);
  });
  it('should respond with a 400 when req.body is empty', done => {
    request
      .post('/guides')
      .send({})
      .expect(400, done);
  });

  it('should not call update when PR is opened', done => {
    request
      .post('/guides')
      .send(masterPROpen)
      .expect(() => {
        if (guideUpdateStub.called) {
          throw new Error('guide update called!');
        }
      })
      .expect(200, done);
  });

  it('should not call update when PR is closed and not merged', done => {
    request
    .post('/guides')
    .send(masterNotMergedPR)
    .expect(200)
    .expect(() => {
      if (guideUpdateStub.called) {
        throw new Error('guide update called!');
      }
    })
    .end(done);
  });

  it('should not call update when PR is merged on a different branch', done => {
    request
    .post('/guides')
    .send(notMasterMergedPR)
    .expect(200)
    .expect(() => {
      if (guideUpdateStub.called) {
        throw new Error('guide update called!');
      }
    })
    .end(done);
  });

  it('should call update when PR is merged on master', done => {
    request
    .post('/guides')
    .send(masterMergedPR)
    .expect(200)
    .expect(() => {
      if (!guideUpdateStub.called) {
        throw new Error('guide update wasn\'t called!');
      }
    })
    .end(done);
  });
});