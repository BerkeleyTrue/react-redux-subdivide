/* global document:false*/
import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import {
  IndexRoute,
  Link,
  Route,
  Router,
  hashHistory
} from 'react-router';

// console.log(require.context('./pages/'), 'hello')
let pages = require.context('./pages', false, /.*.js$/)
  .keys()
  .map(page => page.replace('./', '').replace('.js', ''));

const Menu = () => {
  const menu = pages
    .map(page => <Link
      key={ page }
      to={ page }
      >
      { page }
    </Link>
  );
  return <div>{ menu }</div>;
};

Page.propTypes = {
  children: PropTypes.element
};
const Page = ({ children })=> {
  return (
    <div>
      { children }
    </div>
  );
};

Demo.propTypes = {
  params: PropTypes.shapeOf({
    demo: PropTypes.string
  })
};
const Demo = ({ params }) => {
  let DemoComponent = require(`./pages/${params.demo}.js`).default;
  return (<div><p/><DemoComponent/></div>);
};

const App = () => (
  <Router history={ hashHistory }>
    <Route
  component={ Page }
      path='/'
      >
      <IndexRoute component={ Menu } />
      <Route
        component={ Demo }
        path='/:demo'
      />
    </Route>
  </Router>
);

const content = document.getElementById('content');

render(<App/>, content);
