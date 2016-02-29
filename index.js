'use strict'

function pullFromQueue (options, callback) {
  if (!options) {
    return callback(new Error('Missing required input: options object'), null)
  }

  if (!options.key) {
    return callback(new Error('Missing required input: options.key'), null)
  }

  if (!options.payload) {
    return callback(new Error('Missing required input: options.payload'), null)
  }

  if (!options.jobFolderPath) {
    return callback(new Error('Missing required input: options.jobFolderPath'), null)
  }

  if (!options.queueNextUrl) {
    return callback(new Error('Missing required input: options.queueNextUrl'), null)
  }

  if (!options.deleteFromQueueUrl) {
    return callback(new Error('Missing required input: options.deleteFromQueueUrl'), null)
  }

  if (!options.statusMessage) {
    return callback(new Error('Missing required input: options.statusMessage'), null)
  }

  var fs = require('fs')
  var Wreck = require('wreck')
  var generateToken = require('./lib/generate-token')
  var token = generateToken({key: options.key, payload: options.payload})
  var wreckOptions = {
    json: true,
    headers: {
      Authorization: token
    }
  }
  var job
  var CALLBACK_STATUS_URL

  function handleStatusUpdates (error, response, payload) {
    if (error) {
      return callback(error, null)
    } else {
      return callback(null, {message: 'Job ' + job._id + ' downloaded. Status updated.'})
    }
  }

  function handleDelete (error, response, payload) {
    if (error) {
      return callback(error, null)
    } else {
      if (CALLBACK_STATUS_URL) {
        wreckOptions.payload = JSON.stringify({status: options.statusMessage})
        Wreck.post(CALLBACK_STATUS_URL, wreckOptions, handleStatusUpdates)
      } else {
        return callback(null, {message: 'Job ' + job._id + ' downloaded.'})
      }
    }
  }

  function handleWrite (error) {
    if (error) {
      return callback(error, null)
    } else {
      Wreck.delete(options.deleteFromQueueUrl + '/' + job._id, wreckOptions, handleDelete)
    }
  }

  function handleNext (error, response, payload) {
    if (error) {
      return callback(error, null)
    } else {
      if (payload && payload.length > 0) {
        job = payload[0]
        if (job.CALLBACK_STATUS_URL) {
          CALLBACK_STATUS_URL = job.CALLBACK_STATUS_URL + '/' + job._id
          job.CALLBACK_STATUS_URL = CALLBACK_STATUS_URL
        }
        fs.writeFile(options.jobFolderPath + '/' + job._id + '.json', JSON.stringify(job, null, 2), 'utf-8', handleWrite)
      } else {
        return callback(new Error('No jobs in queue'), null)
      }
    }
  }

  Wreck.get(options.queueNextUrl, wreckOptions, handleNext)
}

module.exports = pullFromQueue
