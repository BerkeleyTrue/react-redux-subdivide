/* global document:false*/
import React from 'react';
import { createStore, combineReducers } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import App from './pages/iframe.jsx';
import { reducer as subdivide } from '../src';

const store = createStore(
  combineReducers({
    [subdivide]: subdivide
  }),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

render(
  (<Provider store={ store }>
    <App/>
  </Provider>),
  document.getElementById('root')
);
