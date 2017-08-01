import chokidar from 'chokidar';
import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import WebpackDevServer from 'webpack-dev-server';
import { clean } from 'require-clean';
import mongoose from 'mongoose';
import { exec } from 'child_process';
import config from './webpack.config';
import owambeSchema from './data/schema/index';

mongoose.Promise = require('bluebird');

const APP_PORT = 3000;
const GRAPHQL_PORT = 8080;

/* eslint require-jsdoc: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */

let graphQLServer;
let appServer;

const app = express();
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  // if NODE_ENV is not test use the dev db
  mongoose.connect('mongodb://127.0.0.1/owambe', { useMongoClient: true });
} else {
  mongoose.connect('mongodb://127.0.0.1/owambe-test', { useMongoClient: true });
}

function startAppServer (callback) {
  // Serve the Relay app
  const compiler = webpack(config);
  appServer = new WebpackDevServer(compiler, {
    contentBase: '/public/',
    proxy: { '/graphql': `http://localhost:${GRAPHQL_PORT}` },
    publicPath: '/js/',
    stats: { colors: true },
  });
  // Serve static resources
  appServer.use('/', express.static(path.resolve(__dirname, 'public')));

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error...'));

  db.once('open', () => {
    console.log('owambe db opened');
  });

  appServer.listen(APP_PORT, () => {
    console.log(`App is now running on http://localhost:${APP_PORT}`);
    if (callback) {
      callback();
    }
  });
}

function startGraphQLServer (callback) {
  // Expose a GraphQL endpoint
  clean('./data/schema/index.js');
  app.use('/graphql', graphQLHTTP({
    schema: owambeSchema,
    graphiql: true,
    pretty: true,
  }));
  graphQLServer = app.listen(GRAPHQL_PORT, () => {
    console.log(
      `GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`,
    );
    if (callback) {
      callback();
    }
  });
}

function startServers (callback) {
  // Shut down the servers
  if (appServer) {
    appServer.listeningApp.close();
  }
  if (graphQLServer) {
    graphQLServer.close();
  }

  // Compile the schema
  exec('npm run update-schema', (error, stdout) => {
    console.log(stdout);
    let doneTasks = 0;
    function handleTaskDone () {
      doneTasks++;
      if (doneTasks === 2 && callback) {
        callback();
      }
    }
    startGraphQLServer(handleTaskDone);
    startAppServer(handleTaskDone);
  });
}
const watcher = chokidar.watch('./data/{schema}.js');
watcher.on('change', (path) => {
  console.log(`\`${path}\` changed. Restarting.`);
  startServers(() =>
    console.log('Restart your browser to use the updated schema.'),
  );
});
startServers();
