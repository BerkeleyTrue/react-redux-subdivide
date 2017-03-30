import React, { PropTypes, Component } from 'react';
import Subdivide from '../../src';

const styles = {
  menu: {
    display: 'flex',
    flexDirection: 'column',
    margin: 2,
    fontFamily: 'sans-serif',
    colof: '#333'
  },
  linkOuter: {
    display: 'flex',
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    cursor: 'pointer',
    transition: 'color .3s',
    margin: 2,
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  }
};

const urls = [
  {
    url: 'http://jsbin.com/vexawi/2/edit?js',
    label: 'jsbin'
  },
  {
    url: 'https://github.com/berkeleytrue/react-redux-subdivide',
    label: 'React-Redux-Subdivide'
  }
];

const Iframe = ({ src }) => (
  <iframe
    frameBorder={ '0' }
    src={ src }
    style={{
      width: '100%',
      height: '100%'
    }}
  />
);
Iframe.propTypes = {
  src: PropTypes.string
};


const Link = ({ onSelect, children }) => (
  <div
    onClick={ onSelect }
    style={ styles.linkOuter }
    >
    <div>{ children }</div>
  </div>
);
Link.propTypes = {
  children: PropTypes.node,
  onSelect: PropTypes.func
};

const Menu = ({ urls, onSelect }) => (
  <div style={ styles.menu }>
    {
      urls.map(({ url, label }, i) => (
        <Link
          key={ i }
          onSelect={ () => onSelect(url) }
          >
          { label }
        </Link>
      ))
    }
  </div>
);
Menu.propTypes = {
  onSelect: PropTypes.func,
  urls: PropTypes.array
};


class Chooser extends Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.state = { url: '' };
  }

  onSelect(url) {
    this.setState({ url });
  }

  render() {
    const { url } = this.state;

    return url === '' ?
      <Menu
        onSelect={this.onSelect.bind(this)}
        urls={urls}
      /> :
      <Iframe src={url} />;
  }
}

const App = () => <Subdivide DefaultComponent={ Chooser } />;

export default App;
