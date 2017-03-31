import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import Pane from './Pane.jsx';
import Dividers from './Dividers.jsx';

import AnimationFrame from '../helpers/AnimationFrame';
import {
  corners,
  directions,
  getNSState,
  pressedDividerSelector,
  splitTypes,

  cornerReleased,
  dividerReleased,
  dividerMoved,
  split
} from '../redux';

const minRatioChange = 20;
const mapStateToProps = state => ({
  subdivide: getNSState(state),
  pressedDivider: pressedDividerSelector(state)
});
const mapDispatchToProps = {
  cornerReleased,
  dividerReleased,
  dividerMoved,
  split
};

const propTypes = {
  DefaultComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string
  ]),
  cornerReleased: PropTypes.func,
  dividerMoved: PropTypes.func,
  dividerReleased: PropTypes.func,
  pressedDivider: PropTypes.object,
  split: PropTypes.func,
  subdivide: PropTypes.object
};

export class Layout extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    const {
      cornerReleased,
      dividerReleased,
      dividerMoved,
      split
    } = props;
    this.animationFrame = new AnimationFrame();

    this.onMouseMove = this.animationFrame.throttle(({ clientX, clientY }) => {
      const { pressedDivider, subdivide } = this.props;

      if (pressedDivider.id) {
        const {
          afterPaneId,
          beforePaneId,
          direction,
          parentSize,
          startX,
          startY
        } = pressedDivider;

        const delta = direction === splitTypes.horizontal ?
          clientX - startX :
          clientY - startY;
        const deltaRatio = delta / parentSize;
        const afterRatio = pressedDivider.afterRatio - deltaRatio;
        const beforeRatio = pressedDivider.beforeRatio + deltaRatio;
        if (
          beforeRatio * parentSize > minRatioChange &&
          afterRatio * parentSize > minRatioChange
        ) {
          dividerMoved(beforePaneId, afterPaneId, beforeRatio, afterRatio);
        }
      }

      if (subdivide.cornerDown) {
        const pane = subdivide.cornerDown;
        const { width, height, left, top, id, corner } = pane;

        if (clientX > left && clientX < left + width &&
          clientY > top && clientY < top + height) {

          if (corner === corners.sw) {
            if (clientX - left > 25) {
              split(id, directions.left, clientX, clientY);
            } else if (top + height - clientY > 25) {
              split(id, directions.down, clientX, clientY);
            }
          }

          if (corner === corners.ne) {
            if (left + width - clientX > 25) {
              split(id, directions.right, clientX, clientY);
            } else if (clientY - top > 25) {
              split(id, directions.up, clientX, clientY);
            }
          }

          if (corner === corners.se) {
            if (left + width - clientX > 25) {
              split(id, directions.right, clientX, clientY);
            } else if (top + height - clientY > 25) {
              split(id, directions.down, clientX, clientY);
            }
          }

          if (corner === corners.nw) {
            if (clientX - left > 25) {
              split(id, directions.left, clientX, clientY);
            } else if (clientY - top > 25) {
              split(id, directions.up, clientX, clientY);
            }
          }
        }
      }

    });

    this.onMouseUp = () => {
      const { subdivide } = this.props;
      if (subdivide.dividerDown) {
        dividerReleased();
      }
      // give pane onMouseUp a chance to fire
      setTimeout(()=>{
        if (subdivide.cornerDown) {
          cornerReleased();
        }
      }, 10);
    };

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  componentWillUnmount() {
    this.animationFrame.stop();
  }

  render() {
    const { subdivide, DefaultComponent } = this.props;
    const panes = Object.keys(subdivide.panesById)
      .map(key => subdivide.panesById[key])
      .filter(pane => !pane.isGroup)
      .map(pane => {
        return (
          <Pane
            DefaultComponent={ DefaultComponent }
            key={ pane.id }
            pane={ pane }
            subdivide={ subdivide }
          />
        );
      });

    return (
      <div>
        { panes }
        <Dividers
          dividers={ subdivide.dividers }
          subdivide={ subdivide }
        />
      </div>
    );
  }
}

Layout.propTypes = propTypes;
Layout.displayName = 'Layout';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
