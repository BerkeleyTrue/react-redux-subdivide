import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Pane from './Pane.jsx';
import Dividers from './Dividers.jsx';

import {
  ns,

  layoutMounted,

  paneIdsSelector,
  pressedDividerSelector
} from '../redux';

const mapStateToProps = createSelector(
  pressedDividerSelector,
  paneIdsSelector,
  (pressedDivider, panes) => ({
    pressedDivider,
    panes
  })
);
const mapDispatchToProps = {
  layoutMounted
};

const propTypes = {
  DefaultComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string
  ]),
  layoutMounted: PropTypes.func,
  panes: PropTypes.array,
  pressedDivider: PropTypes.object
};

export class Subdivide extends Component {
  componentDidMount() {
    this.props.layoutMounted();
  }

  renderPanes(panes = [], DefaultComponent) {
    return panes
      .map(paneId => {
        return (
          <Pane
            DefaultComponent={ DefaultComponent }
            key={ paneId }
            paneId={ paneId }
          />
        );
      });
  }

  render() {
    const {
      DefaultComponent,
      panes
    } = this.props;

    return (
      <div id={ ns }>
        { this.renderPanes(panes, DefaultComponent) }
        <Dividers />
      </div>
    );
  }
}

Subdivide.propTypes = propTypes;
Subdivide.displayName = 'Subdivide';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Subdivide);
