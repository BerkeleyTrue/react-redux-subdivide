import React, { Component } from 'react';
import Pane from './Pane';
import Dividers from './Dividers';
import AnimationFrame from '../helpers/AnimationFrame';
import {
  cardinals,
  directions,
  downDividerSelector,
  splitTypes
} from '../reducers';

export default class Layout extends Component {
  static defaultProps = {
    iframeSafe: true
  };

  constructor(props, context) {
    super(props, context);
    this.animationFrame = new AnimationFrame();
    const { setSize } = props.actions;

    this.onMouseMove = this.animationFrame.throttle(({ clientX, clientY }) => {
      const { actions, subdivide } = this.props;

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
          actions.setSplitRatio(beforePaneId, beforeRatio);
          actions.setSplitRatio(afterPaneId, afterRatio);
        }
      }

      if (subdivide.cornerDown) {
        const pane = subdivide.cornerDown;
        const { split } = actions;
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
      const { actions, subdivide } = this.props;
      if (subdivide.dividerDown) {
        actions.setDividerDown();
      }
      // give pane onMouseUp a chance to fire
      setTimeout(()=>{
        if (subdivide.cornerDown) {
          actions.setCornerDown();
        }
      }, 10);
    };

    window.addEventListener('resize', () => {
      setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);


    setSize(window.innerWidth, window.innerHeight);
  }

  componentWillUnmount() {
    this.animationFrame.stop();
  }

  render() {
    const { subdivide, actions, DefaultComponent } = this.props;
    const panes = Object.keys(subdivide.panesById)
      .map(key => subdivide.panesById[key])
      .filter(pane => !pane.isGroup)
      .map(pane => {
        return (
          <Pane
            actions={ actions }
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
          actions={ actions }
          dividers={ subdivide.dividers }
          subdivide={ subdivide }
        />
      </div>
    );
  }
}
