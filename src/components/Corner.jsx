import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
  corners,

  cornerPressed,
  hoverOverCorner,
  blurCorner,

  hoveredCornerSelector,
  pressedDividerSelector
} from '../redux';

const color = '#dadadf';
const size = 42;
const offset = (size + 3) / 2;

const propTypes = {
  blurCorner: PropTypes.func,
  corner: PropTypes.string,
  cornerPressed: PropTypes.func,
  hoverOverCorner: PropTypes.func,
  isDividerPressed: PropTypes.bool,
  isHovered: PropTypes.bool,
  paneId: PropTypes.number
};

function makeMapStateToProps(state, { corner, paneId }) {
  return createSelector(
    hoveredCornerSelector,
    pressedDividerSelector,
    (hoveredCorner, pressedDivider) => {
      return {
        isDividerPressed: !!pressedDivider.id,
        isHovered: hoveredCorner.paneId === paneId &&
          hoveredCorner.corner === corner
      };
    }
  );
}
function mapDispatchToProps(dispatch, { corner, paneId }) {
  const payload = { corner, paneId };
  const dispatchers = {
    blurCorner: () => dispatch(blurCorner()),
    cornerPressed: () => dispatch(cornerPressed(payload)),
    hoverOverCorner: () => dispatch(hoverOverCorner(payload))
  };
  return () => dispatchers;
}

export class Corner extends Component {
  getStyles() {
    const {
      corner,
      isHovered,
      isDividerPressed
    } = this.props;
    const outer = {
      backgroundColor: 'rgba(0,0,0,0)',
      display: isDividerPressed ? 'none' : 'block',
      height: size,
      opacity: 1,
      position: 'absolute',
      width: size
    };

    if (corner === corners.ne) {
      Object.assign(outer, {
        cursor: 'grab',
        right: 0,
        top: 0,
        transform: `translate3d(${offset}px, ${-offset}px, 0) rotate(225deg)`
      });
    } else if ( corner === corners.sw) {
      Object.assign(outer, {
        bottom: 0,
        cursor: 'grab',
        left: 0,
        transform: `translate3d(${-offset}px, ${offset}px, 0) rotate(45deg)`
      });
    } else if (corner === corners.se) {
      Object.assign(outer, {
        bottom: 0,
        cursor: 'grab',
        right: 0,
        transform: `translate3d(${offset}px, ${offset}px, 0) rotate(315deg)`
      });
    } else if (corner === corners.nw) {
      Object.assign(outer, {
        cursor: 'grab',
        left: 0,
        top: 0,
        transform: `translate3d(${-offset}px, ${-offset}px, 0) rotate(135deg)`
      });
    }

    const hover = isHovered ? 0 : offset;
    const inner = {
      backgroundColor: color,
      border: '1px solid #c0c0d0',
      height: '100%',
      transform: `translate3d(0, ${hover}px, 0)`,
      transition: 'transform .1s',
      width: '100%'
    };


    return { outer, inner };

  }

  render() {
    const {
      cornerPressed,
      hoverOverCorner,
      blurCorner
    } = this.props;
    const styles = this.getStyles();
    return (
      <div
        onMouseDown={ cornerPressed }
        onMouseEnter={ hoverOverCorner }
        onMouseLeave={ blurCorner }
        style={ styles.outer }
        >
        <div style={ styles.inner } />
      </div>
    );
  }
}

Corner.propTypes = propTypes;
Corner.displayName = 'Corner';

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Corner);
