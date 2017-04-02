import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
  splitTypes,

  dividerPressed,
  makeDividerSelector,
  touchMarginSelector
} from '../redux';

const propTypes = {
  direction: PropTypes.string,
  dividerPressed: PropTypes.func,
  dividerId: PropTypes.string,
  height: PropTypes.number,
  left: PropTypes.number,
  top: PropTypes.number,
  touchMargin: PropTypes.number,
  width: PropTypes.number
};

function makeMapStateToProps(state, { dividerId }) {
  const dividerSelector = makeDividerSelector(dividerId);
  return createSelector(
    dividerSelector,
    touchMarginSelector,
    (divider, touchMargin) => {
      return {
        ...divider,
        touchMargin
      };
    }
  );
}

function mapDispatchToProps(dispatch, { dividerId }) {
  const dispatchers = {
    dividerPressed: ({ clientX, clientY}) => dispatch(dividerPressed({
      dividerId,
      startX: clientX,
      startY: clientY
    }))
  };
  return () => dispatchers;
}

export class Divider extends Component {
  dividerStyle() {
    const {
      direction,
      height,
      left,
      top,
      touchMargin,
      width
    } = this.props;
    const touch = {
      height,
      left,
      position: 'absolute',
      top,
      width
    };
    // backgroundColor: 'rgba(0,0,0,0.5)',

    if (direction === splitTypes.horizontal) {
      touch.cursor = 'row-resize';
      touch.top -= touchMargin;
      touch.height += touchMargin * 2;
    } else {
      touch.cursor = 'col-resize';
      touch.left -= touchMargin;
      touch.width += touchMargin * 2;
    }

    return { touch };
  }

  render() {
    const styles = this.dividerStyle();
    const { dividerPressed } = this.props;

    return (
      <div
        className='divider'
        onMouseDown={ dividerPressed }
        style={ styles.touch }
        >
        <div style={ styles.border }>
           <div style={ styles.inner } />
        </div>
      </div>
    );
  }
}

Divider.displayName = 'Divider';
Divider.propTypes = propTypes;

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Divider);
