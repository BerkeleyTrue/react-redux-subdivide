import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  corners,
  directions,
  splitTypes,

  makePaneSelector,
  pressedDividerSelector,
  pressedCornerSelector
} from '../redux';

const propTypes = {
  canSplit: PropTypes.bool,
  corner: PropTypes.string,
  height: PropTypes.number,
  isDividerPressed: PropTypes.bool,
  isCornerPressed: PropTypes.bool,
  joinDirection: PropTypes.string,
  left: PropTypes.number,
  splitType: PropTypes.string,
  top: PropTypes.number,
  width: PropTypes.number
};

function mapStateToProps(state, { paneId }) {
  return createSelector(
    makePaneSelector(paneId),
    pressedDividerSelector,
    pressedCornerSelector,
    (pane, { id }, { corner }) => {
      return {
        ...pane,
        corner,
        isCornerPressed: !!corner,
        isDividerPressed: !!id
      };
    }
  );
}

const mapDispatchToProps = null;

export class CornerOverlay extends PureComponent {
  componentDidMount() {
    this.updateJoinOverlay();
    this.updateDivideOverlay();
  }

  componentDidUpdate() {
    this.updateJoinOverlay();
    this.updateDivideOverlay();
  }

  updateDivideOverlay() {
    const { canvas } = this.refs;
    const {
      canSplit,
      corner,
      height,
      isCornerPressed,
      width
    } = this.props;
    if (!canSplit || !isCornerPressed) {
      return null;
    }
    const ctx = canvas.getContext('2d');
    const dashRatio = 0.5;
    const dashWidth = 3;
    const dashSpacing = 20;
    const dashLength = dashRatio * dashSpacing;
    const offset = 34;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    if (corner === corners.sw) {
      for (let x = 0; x < width; x += dashSpacing) {
        ctx.rect(x, height - offset - dashWidth, dashLength, dashWidth);
      }

      for (let y = 0; y < height; y += dashSpacing) {
        ctx.rect(offset, height - y - dashLength, dashWidth, dashLength);
      }
    }
    if (corner === corners.ne) {
      for (let x = 0; x < width; x += dashSpacing) {
        ctx.rect(width - x - dashLength, offset, dashLength, dashWidth);
      }

      for (let y = 0; y < height; y += dashSpacing) {
        ctx.rect(width - offset - dashWidth, y, dashWidth, dashLength);
      }
    }
    if (corner === corners.nw) {
      for (let x = 0; x < width; x += dashSpacing) {
        ctx.rect(x, offset, dashLength, dashWidth);
      }

      for (let y = 0; y < height; y += dashSpacing) {
        ctx.rect(offset, y, dashWidth, dashLength);
      }
    }
    if (corner === corners.se) {
      for (let x = 0; x < width; x += dashSpacing) {
        ctx.rect(
          width - x - dashLength,
          height - offset - dashWidth,
          dashLength,
          dashWidth
        );
      }

      for (let y = 0; y < height; y += dashSpacing) {
        ctx.rect(
          width - offset - dashWidth,
          height - y - dashLength,
          dashWidth,
          dashLength
        );
      }
    }

    ctx.fillStyle = '#999';
    ctx.closePath();
    ctx.fill('evenodd');
    return null;
  }

  updateJoinOverlay() {
    const { canvas } = this.refs;
    const {
      height,
      joinDirection,
      width
    } = this.props;
    if (!joinDirection) {
      return null;
    }
    const ctx = canvas.getContext('2d');
    const size = Math.min(width, height);
    const bodyHeight = ((size / 3) / 2) || 0;
    const bodyWidth = bodyHeight;
    const w2 = (width / 2) || 0;
    const h2 = (height / 2) || 0;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, 0);

    if (joinDirection === directions.right) {
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.lineTo(0, h2 + bodyHeight);
      ctx.lineTo(bodyWidth, h2 + bodyHeight);
      ctx.lineTo(bodyWidth, h2 + bodyHeight * 2);
      ctx.lineTo(size / 2, h2);
      ctx.lineTo(bodyWidth, h2 - bodyHeight * 2);
      ctx.lineTo(bodyWidth, h2 - bodyHeight);
      ctx.lineTo(0, h2 - bodyHeight);
    }

    if (joinDirection === directions.left) {
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(width, h2 - bodyHeight);
      ctx.lineTo(width - bodyWidth, h2 - bodyHeight);
      ctx.lineTo(width - bodyWidth, h2 - bodyHeight * 2);
      ctx.lineTo(width - size / 2, h2);
      ctx.lineTo(width - bodyWidth, h2 + bodyHeight * 2);
      ctx.lineTo(width - bodyWidth, h2 + bodyHeight);
      ctx.lineTo(width, h2 + bodyHeight);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
    }

    if (joinDirection === directions.up) {
      ctx.lineTo(0, height);
      ctx.lineTo(width, height);
      ctx.lineTo(w2 - bodyWidth, height);
      ctx.lineTo(w2 - bodyWidth, height - bodyHeight);
      ctx.lineTo(w2 - bodyWidth * 2, height - bodyHeight);
      ctx.lineTo(w2, height - size / 2);
      ctx.lineTo(w2 + bodyWidth * 2, height - bodyHeight);
      ctx.lineTo(w2 + bodyWidth, height - bodyHeight);
      ctx.lineTo(w2 + bodyWidth, height);
      ctx.lineTo(width, height);
      ctx.lineTo(width, 0);
    }

    if (joinDirection === directions.down) {
      ctx.lineTo(0, height);
      ctx.lineTo(width, height);
      ctx.lineTo(width, 0);
      ctx.lineTo(w2 + bodyWidth, 0);
      ctx.lineTo(w2 + bodyWidth, bodyHeight);
      ctx.lineTo(w2 + bodyWidth * 2, bodyHeight);
      ctx.lineTo(w2, size / 2);
      ctx.lineTo(w2 - bodyWidth * 2, bodyHeight);
      ctx.lineTo(w2 - bodyWidth, bodyHeight);
      ctx.lineTo(w2 - bodyWidth, 0);
    }

    ctx.fillStyle = '#999';
    ctx.closePath();

    ctx.fill();
    return null;
  }

  render() {
    const {
      canSplit,
      height,
      isDividerPressed,
      isCornerPressed,
      joinDirection,
      left,
      splitType,
      top,
      width
    } = this.props;
    if (!isDividerPressed && !isCornerPressed) {
      return false;
    }

    if (!joinDirection && !canSplit) {
      let cursor = null;
      if (isDividerPressed) {
        cursor = splitType === splitTypes.vertical ?
          'col-resize' :
          'row-resize';
      }
      return (
        <div style={{
          cursor,
          height: '100%',
          position: 'absolute',
          top: 0,
          width: '100%'
        }}/>
      );
    }
    return (
      <canvas
        height={ Math.round(height + top - (top || 0)) }
        ref='canvas'
        style={{
          background: '#fff',
          left: 0,
          opacity: 0.9,
          position: 'absolute',
          top: 0
        }}
        width={ Math.round(width + left - (left || 0)) }
      />
    );
  }
}

CornerOverlay.propTypes = propTypes;
CornerOverlay.displayName = 'CornerOverlay';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CornerOverlay);
