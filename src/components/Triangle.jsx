import React, { Component } from 'react';

import { cardinals } from '../reducers';

export default class Triangle extends Component {
  constructor(...props) {
    super(...props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseDown() {
    const { actions, corner, pane } = this.props;
    actions.setCornerDown({ ...pane, corner });
  }

  onMouseEnter() {
    const { actions, corner, pane } = this.props;
    actions.setCornerHover({
      paneId: pane.id,
      corner
    });
  }

  onMouseLeave() {
    const { actions } = this.props;
    actions.setCornerHover();
  }

  getStyles() {
    let { corner, color, size, subdivide, pane } = this.props;
    let { cornerHover } = subdivide;
    let offset = (size + 3) / 2;
    let outer = {
      width: size,
      height: size,
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0)',
      opacity: 1,
      display: subdivide.dividerDown ? 'none' : 'block'
    };

    if (corner === cardinals.ne) {
      outer = {
        ...outer,
        top: 0,
        right: 0,
        cursor: 'grab',
        transform: `translate3d(${offset}px, ${-offset}px, 0) rotate(225deg)`
      };
    } else if ( corner === cardinals.sw) {
      outer = {
        ...outer,
        bottom: 0,
        left: 0,
        cursor: 'grab',
        transform: `translate3d(${-offset}px, ${offset}px, 0) rotate(45deg)`
      };
    } else if ( corner === cardinals.se) {
      outer = {
        ...outer,
        bottom: 0,
        right: 0,
        cursor: 'grab',
        transform: `translate3d(${offset}px, ${offset}px, 0) rotate(315deg)`
      };
    } else if ( corner === cardinals.nw) {
      outer = {
        ...outer,
        top: 0,
        left: 0,
        cursor: 'grab',
        transform: `translate3d(${-offset}px, ${-offset}px, 0) rotate(135deg)`
      };
    }

    let hover = cornerHover &&
        cornerHover.paneId === pane.id &&
        cornerHover.corner === corner ?
        0 :
        offset;

    let inner = {
      border: '1px solid #c0c0d0',
      backgroundColor: color,
      width: '100%',
      height: '100%',
      transform: `translate3d(0,${hover}px,0)`,
      transition: 'transform .1s'
    };


    return { outer, inner };

  }

  render() {
    let styles = this.getStyles();
    return (
      <div
        key='outer'
        onMouseDown={ this.onMouseDown }
        onMouseEnter={ this.onMouseEnter }
        onMouseLeave={ this.onMouseLeave }
        style={ styles.outer }
        >
        <div style={ styles.inner } />
      </div>
    );
  }
}
