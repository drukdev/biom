import { existsSync, mkdirSync } from 'fs';
const ecsFormat = require('@elastic/ecs-winston-format');
const { ElasticsearchTransport } = require('winston-elasticsearch');
import winston = require('winston');
const logDir = './logs';

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

let esTransport;
if ('true' === process.env.ELK_LOG?.toLowerCase()) {
  const esTransportOpts = {
  level: `${process.env.LOG_LEVEL}`,
  clientOpts: { node: `${process.env.ELK_LOG_PATH}`,
  auth: {
    username: `${process.env.ELK_USERNAME}`,
    password: `${process.env.ELK_PASSWORD}`
  }
 }
};
esTransport = new ElasticsearchTransport(esTransportOpts);

esTransport.on('error', (error) => {
  console.error('Error caught in logger', error);
});

}

  const winstonLogger = winston.createLogger({
    format: ecsFormat({ convertReqRes: true }),
    transports: [
      ...('true' === process.env.CONSOLE_LOG?.toLowerCase() ? [new winston.transports.Console()] : []),
      //Path to Elasticsearch
      ...('true' === process.env.ELK_LOG?.toLowerCase() ? [esTransport] : [])
    ]
  });
winstonLogger.on('error', (error) => {
  console.error('Error caught in logger', error);
});

Object.freeze(winstonLogger);

export default winstonLogger;
