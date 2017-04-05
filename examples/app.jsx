/* global document:false*/
import React from 'react';
import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';

import App from './pages/iframe.jsx';
import { reducer as subdivideReducer, epic as subdivideEpic } from '../src';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    [subdivideReducer]: subdivideReducer
  }),
  composeEnhancers(
    applyMiddleware(
      createEpicMiddleware(
        subdivideEpic,
        {
          dependencies: {
            window,
            document
          }
        }
      )
    )
  )
);

render(
  (<Provider store={ store }>
    <App/>
  </Provider>),
  document.getElementById('root')
);
