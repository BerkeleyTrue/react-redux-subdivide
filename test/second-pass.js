import test from 'ava';
import secondPass from '../src/helpers/secondPass.js';

import {
  corners,
  createInitialState,
  createPane,
  directions,
  splitTypes
} from '../src/reducers';

test('root should not have join direction', t => {
  const start = createInitialState({
    rootId: 1,
    cornerDown: {
      paneId: 1,
      corner: corners.sw
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.25
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.horizontal,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.75
      })
    }
  });
  const end = secondPass(start);
  t.falsy(
    end.panesById[0].joinDirection,
    'second pass should not add direction to group'
  );
});

test('creates a divider for children', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.33
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.horizontal,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.67
      })
    }
  });
  const end = secondPass(start);
  t.is(
    Object.keys(end.dividers).length,
    1,
    'second pass should add a divider between each child'
  );

  t.truthy(
    end.dividers['0n2'],
    'second pass should add divider id composed of the two panes it divides'
  );
});

test('NE corner join left vertical', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 2,
      corner: corners.ne
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.vertical,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[2].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[0].joinDirection,
    directions.up,
    'second pass should add a join up direction to sibling'
  );
});


test('NE corner join right horizontal', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 0,
      corner: corners.ne
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.horizontal,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[0].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[2].joinDirection,
    directions.right,
    'second pass should add a join right direction to sibling'
  );
});

test('north-west corner join vertical', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 2,
      corner: corners.nw
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.vertical,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[2].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[0].joinDirection,
    directions.up,
    'second pass should add a join up direction to sibling'
  );
});


test('north-west corner join horizontal', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 2,
      corner: corners.nw
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.horizontal,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[2].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[0].joinDirection,
    directions.left,
    'second pass should add a join left direction sibling'
  );
});

test('south-west corner join vertical', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 0,
      corner: corners.sw
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.vertical,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[0].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[2].joinDirection,
    directions.down,
    'second pass should add a join down direction to sibling'
  );
});


test('south-west corner join horizontal', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 2,
      corner: corners.sw
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.horizontal,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[2].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[0].joinDirection,
    directions.left,
    'second pass should add a join left direction to sibling'
  );
});


test('south-east corner join vertical', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 0,
      corner: corners.se
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.vertical,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[0].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[2].joinDirection,
    directions.down,
    'second pass should add a join down direction to sibling'
  );
});


test('south-east corner join horizontal', t => {
  const start = createInitialState({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 0,
      corner: corners.se
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: splitTypes.horizontal,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[0].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[2].joinDirection,
    directions.right,
    'second pass should add a join right direction sibling'
  );
});
