import React from 'react';
import ReactDOM from 'react-dom';
// import { BrowserRouter } from 'react-router-dom';
import 'babel-polyfill';
import Relay from 'react-relay';
import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';

/* eslint no-undef: 0 */

ReactDOM.render(
  // <BrowserRouter>
  //   <App />
  // </BrowserRouter>,
  <Relay.Renderer
    environment={Relay.Store}
    Container={App}
    queryConfig={new AppHomeRoute()}
  />,
  document.getElementById('root'),
);
