'use strict';

const AWS = require('aws-sdk')

module.exports.handle_all = async function (event, context, callback) {
  const { requestContext: { routeKey } } = event;
  switch (routeKey) {
    case '$connect':
      connect(event, context, callback);
      break;

    case '$disconnect':
      disconnect(event, context, callback)
      break;

    case '$default':
      await defaultFunction(event, context, callback)
      break;

    case 'message':
      await echoMessage(event, context, callback);
      break;           
    
    default: break;

  }

  // Return a 200 status to tell API Gateway the message was processed
  // successfully.
  // Otherwise, API Gateway will return a 500 to the client.
  return { statusCode: 200 };
}


const connect = (event, context, cb) => {
  cb(null, {
    statusCode: 200,
    body: 'Connected.'
  });
};

const disconnect = (event, context, cb) => {
  cb(null, {
    statusCode: 200,
    body: 'Disconnected.'
  });
};

const defaultFunction = async (event, context, cb) => {
  // default function that just echos back the data to the client
  const client = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`
  });

  await client
    .postToConnection({
      ConnectionId: event.requestContext.connectionId,
      Data: `default route received: ${event.body}`
    })
    .promise();

  cb(null, {
    statusCode: 200,
    body: 'Sent.'
  });
};

const echoMessage = async (event, context, cb) => {

  console.log(event)

  const client = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `https://${event.requestContext.domainName}/CRICKET/`
  });

  const body = JSON.parse(event.body)

  await client
    .postToConnection({
      ConnectionId: event.requestContext.connectionId,
      Data: `What i got was just: ${body.message}`
    })
    .promise();


  cb(null, {
    statusCode: 200,
    body: 'Got a message!.'
  });
}