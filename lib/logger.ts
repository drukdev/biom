import { existsSync, mkdirSync } from 'fs';
import { Logger, format } from 'winston';
const ecsFormat = require('@elastic/ecs-winston-format')
var {ElasticsearchTransport} = require('winston-elasticsearch');
import winston = require('winston');
const { combine, timestamp, prettyPrint } = format;

const logDir = './logs';

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

var esTransportOpts = {
  level: 'info',
  clientOpts: { node: "http://localhost:9200/" }
};

const esTransport = new ElasticsearchTransport(esTransportOpts);

esTransport.on('error', (error) => {
  console.error('Error in logger caught', error);
});

const logger: Logger = winston.createLogger({
  format: ecsFormat({ convertReqRes: true }),
  // format: combine(
  //   timestamp(),
  //   winston.format.json(),
  //   prettyPrint()
  // ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: `${logDir}/combined.log` }),
    new winston.transports.File({
      //path to log file
      filename: 'logs/log.json',
      level: 'debug'
    }),
    //Path to Elasticsearch
    esTransport
  ],
});

logger.on('error', (error) => {
  console.error('Error in logger caught', error);
});


export default logger;
