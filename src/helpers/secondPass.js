import {
  directions,
  cardinals,
  joinTypes
} from '../reducers';

function getJoinDirection({ subdivide, pane }) {
  const { cornerDown } = subdivide;
  if (!cornerDown) { return false; }
  const cornerDownId = subdivide.cornerDown.id;
  const cornerDownPane = subdivide.panes.get(cornerDownId);
  const parent = subdivide.panes.get(cornerDownPane.parentId);
  if (!parent) { return false; }
  const siblings = parent.childIds;
  const index = siblings.indexOf(cornerDownId);
  const beforeId = index < 1 ? null : siblings.get(index - 1);
  const afterId = siblings.get(index + 1);
  const isBeforeGroup = beforeId !== null &&
    subdivide.panes.get(beforeId).isGroup;
  const isAfterGroup = afterId !== null &&
    subdivide.panes.get(afterId).isGroup;
  const canJoinBefore = beforeId === pane.id && !isBeforeGroup;
  const canJoinAfter = afterId === pane.id && !isAfterGroup;
  const direction = parent.direction;

  return (
    cornerDown.corner === cardinals.ne && (
      (direction === directions.col && canJoinBefore && joinTypes.up) ||
      (direction === directions.row && canJoinAfter && joinTypes.right)
    )
  ) || (
    cornerDown.corner === cardinals.sw && (
      (direction === directions.col && canJoinAfter && joinTypes.down) ||
      (direction === directions.row && canJoinBefore && joinTypes.left)
    )
  ) || (
    cornerDown.corner === cardinals.nw && (
      (direction === directions.col && canJoinBefore && joinTypes.up) ||
      (direction === directions.row && canJoinBefore && joinTypes.left)
    )
  ) || (
    cornerDown.corner === cardinals.se && (
      (direction === directions.col && canJoinAfter && joinTypes.down) ||
      (direction === directions.row && canJoinAfter && joinTypes.right)
    )
  );
}

export default function secondPass(state) {
  let dividerMap = {};

  const { rootId, width, height } = state;
  const left = 0;
  const top = 0;
  let rootPane = state.panes.get(rootId);

  const { cellSpacing, cornerDown } = state;

  rootPane = rootPane.merge({
    width,
    height,
    top,
    left,
    canSplit: cornerDown && cornerDown.id === rootId
  });

  state = state.mergeIn([ 'panes', rootId ], rootPane);

  let flattenChildren = (parent) => {
    let x = parent.left;
    let y = parent.top;
    let spacingOffset;
    let hasDivider = false;
    let beforePaneId;
    let divider;
    let beforeRatio;

    parent.childIds.forEach((childId, i) => {
      let child = state.panes.get(childId);
      let canSplit = cornerDown && cornerDown.id === childId;
      let joinDirection = getJoinDirection({ subdivide: state, pane: child });

      child = child.merge({ canSplit, joinDirection });

      hasDivider = i !== 0;
      spacingOffset = 0;
      if (hasDivider) {
        spacingOffset = cellSpacing;
        divider = {
          id: beforePaneId + 'n' + child.id,
          left: x,
          top: y,
          beforePaneId,
          afterPaneId: child.id,
          beforeRatio,
          afterRatio: child.splitRatio,
          direction: parent.direction,
          parentSize: parent.direction === directions.row ?
            parent.width :
            parent.height
        };
      }

      if (parent.direction === directions.row) {
        if (hasDivider) {
          divider.width = cellSpacing;
          divider.height = parent.height;
          dividerMap = dividerMap.set(divider.id, { ...divider });
          // state = state.setIn(['dividers', divider.id],
          //     new Divider(divider))
          x += cellSpacing;
        }
        child = child.merge({
          width: parent.width * child.splitRatio - spacingOffset,
          height: parent.height,
          left: x,
          top: y
        });
        x += child.width;
      } else if (parent.direction === directions.col) {
        if (hasDivider) {
          divider.width = parent.width;
          divider.height = cellSpacing;
          dividerMap = dividerMap.set(divider.id, { ...divider });
          // state = state.setIn(['dividers', divider.id],
          //     new Divider(divider))
          y += cellSpacing;
        }
        child = child.merge({
          width: parent.width,
          height: parent.height * child.splitRatio - spacingOffset,
          left: x,
          top: y
        });
        y += child.height;
      }

      beforePaneId = child.id;
      beforeRatio = child.splitRatio;
      state = state.mergeIn([ 'panes', childId ], child);
      if (child.isGroup) {
        flattenChildren(child);
      }
    });
  };
  flattenChildren(rootPane);
  state = state.set('dividers', dividerMap);
  return state;
}


