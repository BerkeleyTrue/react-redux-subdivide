import React, { PropTypes } from 'react';

export default function Rectangle({ style }) {
  const { left, top } = style;
  const newStyle = {
    ...style,
    left: 0,
    position: 'absolute',
    top: 0,
    transform: `translate3d(${left}px, ${top}px,0)`
  };
  return <div style={ newStyle } />;
}

Rectangle.propTypes = {
  style: PropTypes.object
};
