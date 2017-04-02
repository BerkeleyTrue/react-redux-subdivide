import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Corner from './Corner.jsx';
import CornerOverlay from './CornerOverlay.jsx';

import {
  corners,

  mouseUpOnPane,

  makePaneSelector
} from '../redux';

const propTypes = {
  paneId: PropTypes.number,
  DefaultComponent: PropTypes.node,
  height: PropTypes.number,
  id: PropTypes.number,
  isGroup: PropTypes.bool,
  left: PropTypes.number,
  mouseUpOnPane: PropTypes.func,
  top: PropTypes.number,
  width: PropTypes.number
};

function makeMapStateToProps(state, { paneId }) {
  const paneSelector = makePaneSelector(paneId);
  return paneSelector;
}

function mapDispatchToProps(dispatch, { paneId }) {
  const dispatchers = {
    mouseUpOnPane: () => dispatch(mouseUpOnPane(paneId))
  };
  return () => dispatchers;
}

export class Pane extends Component {
  render() {
    const {
      DefaultComponent,
      height,
      id,
      isGroup,
      left,
      mouseUpOnPane,
      paneId,
      top,
      width
    } = this.props;

    if (!id || isGroup) {
      return null;
    }

    const style = {
      height: height + 'px',
      left: left + 'px',
      overflow: 'hidden',
      position: 'absolute',
      top: top + 'px',
      width: width + 'px'
    };

    return (
      <div
        onMouseUp={ mouseUpOnPane }
        style={ style }
        >
        <DefaultComponent />
        <CornerOverlay paneId={ paneId } />
        <Corner
          corner={ corners.sw }
          paneId={ id }
        />
        <Corner
          corner={ corners.ne }
          paneId={ id }
          size={ 42 }
        />
        <Corner
          corner={ corners.nw }
          paneId={ id }
          size={ 42 }
        />
        <Corner
          corner={ corners.se }
          paneId={ id }
          size={ 42 }
        />
      </div>
    );
  }
}


Pane.propTypes = propTypes;
Pane.displayName = 'Pane';

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Pane);
