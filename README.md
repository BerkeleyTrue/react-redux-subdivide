# Subdivide Layout

[![Greenkeeper badge](https://badges.greenkeeper.io/BerkeleyTrue/react-redux-subdivide.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/BerkeleyTrue/react-redux-subdivide.svg?branch=master)](https://travis-ci.org/BerkeleyTrue/react-redux-subdivide)
[![Coverage Status](https://coveralls.io/repos/github/BerkeleyTrue/react-redux-subdivide/badge.svg?branch=master)](https://coveralls.io/github/BerkeleyTrue/react-redux-subdivide?branch=master)
[![version](https://img.shields.io/npm/v/react-redux-subdivide.svg?style=flat-square)](http://npm.im/react-redux-subdivide)
[![CC0 License](https://img.shields.io/npm/l/subdivide.svg?style=flat-square)](https://creativecommons.org/publicdomain/zero/1.0/)



Split pane layout system for React and Redux apps. Each pane can be subdivided and any widget assigned to any pane allowing users define layout. Panes can be:

* subdivided above a minimum size
* subdivided horizontally or vertically
* subdivided by dragging corners
* resized by dragging edges
* merged by dragging corners onto adjacent panes 

When a new pane is created the user can chose which widget to display in that pane. The result is an application where the user can decide on an interface that suits their work flow.

It should also be possible to quickly mash up applications out of preexisting parts.

----


## Usage

```bash
npm install react-redux-subdivide
```

Subdivide exposes the `Subdivide` component, a redux `reducer`, and a redux-observable `epic`.



```jsx
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  createStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import { connect, Provider } from 'react-redux';
import {
  createEpicMiddleware,
  combineEpics
} from 'redux-observable';
import myEpics from './my-epics.js';

import {
  Subdivide,
  reducer as subdivideReducer,
  epic as subdivideEpic
} from 'subdivide';


class Chooser extends Component {
  constructor(...args) {
    super(...args);
    this.state = { choice: null };
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(choice) {
    this.setState({ choice });
  }
  
  renderMenu() {
    const choices = [
  	  'world',
  	  'moon',
  	  'universe',
  	  'galaxy'
  	];
  	return choices.map(choice => (
      <button
        key={ choice }
        onSelect={ () => onSelect(choice) }
        >
        { choice }
      </button>
    ));
);


  render() {
    const { choice } = this.state;

    return !choice ?
      <div>{ this.renderChoices() }</div> :
      <h1 />Hello { choice }!</h1>;
  }
}

const epicMiddleware =  createEpicMiddleware(
  combineEpics(...myEpics, subdivideEpic),
  // make sure to provide dependencies here
  // so subdivide can interface with the users
  // mouse movements
  { dependencies: { window, document } }
);

const store = createStore(
  combineReducers({
  	// this syntax will put the subdivide reducer
  	// on it's own key in the redux store.
  	// without doing this subdivide will not now
  	// where to look for it's own state
  	[subdivideReducer]: subdivideReducer
  }),
  applyMiddleware(
    epicMiddleware
  )
);

ReactDOM.render(
  <Provider store={store}>
    <Subdivide DefaultComponent={Chooser} />
  </Provider>,
  document.getElementById('root')
);
```

## Run Example
```bash
npm install
npm start
```

Open the following link in a browser:

[`http://localhost:3000`](http://localhost:3000)

## Testing

Run the following two commands in separate terminals

```bash
npm run test:watch
npm run cover:watch
```

The first will start the testing scripts and rerun them on file changes.
The second will run a task that will watch for file changes and run the coverage on the files.

You can open the html page displaying current coverage using the following

```bash
npm run cover:show
```


----


React-redux-subdivide is based off of the fantastic [Subdivide](https://github.com/philholden/subdivide) project.

Although similar in appearence, the main differences from that project is a significant change in API, removing Immutable.js, adding the powerfull RxJS to accomplish the complex side-effects in Redux using [Redux-Observable](https://github.com/redux-observable/redux-observable)

