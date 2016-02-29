'use strict'

var config = {
  JWT_KEY: process.env.TFK_SQP_JWT_KEY || 'NeverShareYourSecret',
  CALLBACK_STATUS_MESSAGE: process.env.TFK_SQP_CALLBACK_STATUS_MESSAGE || 'Til behandling',
  JOB_DIRECTORY_PATH: process.env.TFK_SQP_JOB_DIRECTORY_PATH || 'test/data/jobs',
  QUEUE_NEXT_URL: process.env.TFK_SQP_QUEUE_NEXT_URL || 'https://example.com/api/queue/next',
  QUEUE_DELETE_URL: process.env.TFK_SQP_QUEUE_DELETE_URL || 'https://example.com/api/queue'
}

module.exports = config
