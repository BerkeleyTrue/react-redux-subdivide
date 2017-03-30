import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
  splitTypes,
  dividerSelector,
  touchMarginSelector
} from '../redux';

const propTypes = {
  direction: PropTypes.string,
  dividerId: PropTypes.string,
  height: PropTypes.number,
  left: PropTypes.number,
  top: PropTypes.number,
  touchMargin: PropTypes.number,
  width: PropTypes.number
};

const mapStateToProps = createSelector(
  dividerSelector,
  touchMarginSelector,
  (divider, touchMargin) => {
    return {
      ...divider,
      touchMargin
    };
  }
);

mapStateToProps.dependsOnOwnProps = true;

const mapDispatchToProps = null;

export class Divider extends Component {
  constructor(props, context) {
    super(props, context);

    this.removeListeners = () => {
      document.removeEventListener('mouseup', this.onMouseUp);
    };

    this.onMouseUp = () => {
      const { actions } = this.props;
      actions.setDividerDown();
      this.removeListeners();
    };

    this.onMouseDown = ({ clientX, clientY }) => {
      const { actions, divider } = this.props;

      actions.setDividerDown({ ...divider, startX: clientX, startY: clientY });

      document.addEventListener('mouseup', this.onMouseUp);
    };
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  dividerStyle() {
    const {
      touchMargin
    } = this.props;
    const { width, height, top, left, direction } = this.props.divider;
    let touch = {
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

    return (
      <div
        className='divider'
        onMouseDown={ this.onMouseDown }
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
  mapStateToProps,
  mapDispatchToProps
)(Divider);
