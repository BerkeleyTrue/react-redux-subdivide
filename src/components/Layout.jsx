import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Pane from './Pane.jsx';
import Dividers from './Dividers.jsx';
import AnimationFrame from '../helpers/AnimationFrame';
import {
  cardinals,
  directions,
  downDividerSelector,
  splitTypes,

  setCornerDown,
  setDividerDown,
  setSplitRatio,
  split,
  windowResize
} from '../reducers';

const mapStateToProps = null;
const mapDispatchToProps = {
  setCornerDown,
  setDividerDown,
  setSplitRatio,
  split,
  windowResize
};

const propTypes = {
  DefaultComponent: PropTypes.element,
  setCornerDown: PropTypes.func,
  setDividerDown: PropTypes.func,
  setSplitRatio: PropTypes.func,
  split: PropTypes.func,
  windowResize: PropTypes.func
};

export class Layout extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    const {
      setCornerDown,
      setDividerDown,
      setSplitRatio,
      split,
      windowResize
    } = props;
    this.animationFrame = new AnimationFrame();

    this.onMouseMove = this.animationFrame.throttle(({ clientX, clientY }) => {
      const { subdivide } = this.props;

      if (subdivide.dividerDown) {
        const divider = subdivide.dividerDown;
        const {
          beforePaneId,
          afterPaneId,
          direction,
          parentSize,
          startX,
          startY
        } = downDividerSelector(subdivide);

        let delta = direction === directions.row ?
          clientX - startX :
          clientY - startY;
        let deltaRatio = delta / parentSize;
        let afterRatio = divider.afterRatio - deltaRatio;
        let beforeRatio = divider.beforeRatio + deltaRatio;
        if (beforeRatio * parentSize > 20 && afterRatio * parentSize > 20) {
          setSplitRatio(beforePaneId, beforeRatio);
          setSplitRatio(afterPaneId, afterRatio);
        }
      }

      if (subdivide.cornerDown) {
        const pane = subdivide.cornerDown;
        const { width, height, left, top, id, corner } = pane;

        if (clientX > left && clientX < left + width &&
          clientY > top && clientY < top + height) {

          if (corner === cardinals.sw) {
            if (clientX - left > 25) {
              split(id, splitTypes.left, clientX, clientY);
            } else if (top + height - clientY > 25) {
              split(id, splitTypes.below, clientX, clientY);
            }
          }

          if (corner === cardinals.ne) {
            if (left + width - clientX > 25) {
              split(id, splitTypes.right, clientX, clientY);
            } else if (clientY - top > 25) {
              split(id, splitTypes.above, clientX, clientY);
            }
          }

          if (corner === cardinals.se) {
            if (left + width - clientX > 25) {
              split(id, splitTypes.right, clientX, clientY);
            } else if (top + height - clientY > 25) {
              split(id, splitTypes.below, clientX, clientY);
            }
          }

          if (corner === cardinals.nw) {
            if (clientX - left > 25) {
              split(id, splitTypes.left, clientX, clientY);
            } else if (clientY - top > 25) {
              split(id, splitTypes.above, clientX, clientY);
            }
          }
        }
      }

    });

    this.onMouseUp = () => {
      const { subdivide } = this.props;
      if (subdivide.dividerDown) {
        setDividerDown();
      }
      // give pane onMouseUp a chance to fire
      setTimeout(()=>{
        if (subdivide.cornerDown) {
          setCornerDown();
        }
      }, 10);
    };

    window.addEventListener('resize', () => {
      windowResize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);


    windowResize(window.innerWidth, window.innerHeight);
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
