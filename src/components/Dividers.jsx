import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import DividerTouch from './DividerTouch.jsx';
import Rectangle from './Rectangle.jsx';

import { splitTypes, getNSState } from '../redux';

const propTypes = {
  borderSize: PropTypes.number,
  dividers: PropTypes.array,
  layoutHeight: PropTypes.number,
  layoutWidth: PropTypes.number
};

const mapStateToProps = createSelector(
  state => getNSState(state).borderSize,
  state => getNSState(state).dividers,
  state => getNSState(state).height,
  state => getNSState(state).width,
  (borderSize, dividers, layoutHeight, layoutWidth) => {
    return {
      borderSize,
      dividers: Object.keys(dividers).map(id => dividers[id]),
      layoutHeight,
      layoutWidth
    };
  }
);

const mapDispatchToProps = null;

export class Dividers extends Component {
  renderBorder({ width, height, top, left, id }) {
    const style = {
      backgroundColor: '#c0c0d0',
      height,
      left,
      top,
      width
    };

    return (
      <Rectangle
        key={ id }
        style={ style }
      />
    );
  }

  renderInner({ width, height, top, left, id, direction }) {
    const {
      borderSize,
      layoutHeight,
      layoutWidth
    } = this.props;
    let style;
    debugger;
    if (direction === splitTypes.horizontal) {
      style = {
        height: height - borderSize * 2,
        left: left - borderSize,
        top: top + borderSize,
        width: width + borderSize * 2
      };
    } else {
      style = {
        height: height + borderSize * 2,
        left: left + borderSize,
        top: top - borderSize,
        width: width - borderSize * 2
      };
    }

    if (style.left < 0) {
      style.width = style.width + style.left;
      style.left = 0;
    }

    if (style.top < 0) {
      style.height = style.height + style.top;
      style.top = 0;
    }

    style.width = Math.min(style.width, layoutWidth - style.left);
    style.height = Math.min(style.height, layoutHeight - style.top);
    style.backgroundColor = '#e0e0f0';

    return (
      <Rectangle
        key={ id }
        style={ style }
      />
    );
  }

  render() {
    const { dividers } = this.props;

    return (
      <div>
        { dividers.map(this.renderInner, this) }
        { dividers.map(this.renderBorder) }
        {
          dividers.map(divider => (
            <DividerTouch
              divider={ divider }
              dividerId={ divider.id }
              key={ divider.id }
            />
          ))
        }
      </div>
    );
  }
}

Dividers.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dividers);
