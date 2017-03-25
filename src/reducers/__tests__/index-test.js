import expect from 'expect';
import reducer, {
  createLayout,
  createPane,
  directions,
  splitTypes,
  split,
  join
} from '../';

describe('pane reducer', () => {
  let startState, endState, action;


  beforeEach(() => {
    startState = {
      panes: {}
    };
  });

  describe('split right', () => {
    let original, parent, added;
    beforeEach(() => {
      startState = createLayout();

      action = split(0, splitTypes.right);

      endState = reducer(startState, action);
      original = endState.panesById[0];
      parent = endState.panesById[original.parentId];
      added = endState.panesById[parent.childIds[parent.childIds.length - 1]];
    });

    it('parent should be added', () => {
      expect(parent).toExist();
    });

    it('new child should be added', () => {
      expect(added).toExist();
    });

    it('parent should have two children in correct order', () => {
      expect(parent.childIds).toEqual([ original.id, added.id ]);
    });

    it('parents direction should be row', () => {
      expect(parent.direction).toEqual(directions.row);
    });

    it('original and added should have parent as parent', () => {
      expect(original.parentId).toEqual(parent.id);
      expect(added.parentId).toEqual(parent.id);
    });
  });

  describe('split left', () => {
    let original, parent, added;
    beforeEach(() => {
      startState = createLayout();

      action = split(0, splitTypes.left);

      endState = reducer(startState, action);
      original = endState.panesById[0];
      parent = endState.panesById[original.parentId];
      added = endState.panesById[parent.childIds[0]];
    });

    it('parent should have two children in correct order', () => {
      expect(parent.childIds).toEqual([ added.id, original.id ]);
    });

    it('parents direction should be row', () => {
      expect(parent.direction).toEqual(directions.row);
    });
  });

  describe('split above', () => {
    let original, parent, added;
    beforeEach(() => {
      startState = createLayout();

      action = split(0, splitTypes.above);

      endState = reducer(startState, action);
      original = endState.panesById[0];
      parent = endState.panesById[original.parentId];
      added = endState.panesById[parent.childIds[0]];
    });

    it('parent should have two children in correct order', () => {
      expect(parent.childIds).toEqual([ added.id, original.id ]);
    });

    it('parents direction should be col', () => {
      expect(parent.direction).toEqual(directions.col);
    });
  });

  describe('split below', () => {
    let original, parent, added;
    beforeEach(() => {
      startState = createLayout();

      action = split(0, splitTypes.below);

      endState = reducer(startState, action);
      original = endState.panesById[0];
      parent = endState.panesById[original.parentId];
      added = endState.panesById[parent.childIds[parent.childIds.length - 1]];
    });

    it('parent should have two children in correct order', () => {
      expect(parent.childIds).toEqual([ original.id, added.id ]);
    });

    it('parents direction should be col', () => {
      expect(parent.direction).toEqual(directions.col);
    });
  });

  describe('join one of two in row below root', () => {
    beforeEach(() => {
      startState = createLayout({
        rootId: 1,
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
            direction: directions.row,
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

      action = join(2, 0);
      endState = reducer(startState, action);
    });

    it('remaining pane should be root', () => {
      expect(endState.rootId).toEqual(2);
    });

    it('parent pane should be deleted', () => {
      expect(endState.panesById[1]).toNotExist();
    });

    it('removed pane should be deleted', () => {
      expect(endState.panesById[0]).toNotExist();
    });

    it('remaining pane should exist', () => {
      expect(endState.panesById[2]).toExist();
    });

    it('remaining pane should not have direction', () => {
      expect(endState.panesById[2].direction).toNotExist();
    });

    it('remaining pane should not have parent', () => {
      expect(endState.panesById[2].parent).toNotExist();
    });

  });


  describe('join one of three in row below root', () => {
    beforeEach(() => {
      startState = createLayout({
        rootId: 1,
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
            childIds: [ 0, 2, 3 ],
            isGroup: true,
            direction: directions.row,
            parentId: null,
            splitRatio: 1
          }),
          2: createPane({
            id: 2,
            childIds: [],
            isGroup: false,
            direction: null,
            parentId: 1,
            splitRatio: 0.33
          }),
          3: createPane({
            id: 3,
            childIds: [],
            isGroup: false,
            direction: null,
            parentId: 1,
            splitRatio: 0.33
          })
        }
      });

      action = join(2, 0);
      endState = reducer(startState, action);
    });

    it('root should be unchanged', () => {
      expect(endState.rootId).toEqual(1);
    });

    it('parent pane should not be deleted', () => {
      expect(endState.panesById[1]).toExist();
    });

    it('parent pane should have 2 children', () => {
      expect(endState.panesById[1].childIds).toEqual([ 2, 3 ]);
    });

    it('removed pane should be deleted', () => {
      expect(endState.panesById[0]).toNotExist();
    });

    it('remaining pane should exist', () => {
      expect(endState.panesById[2]).toExist();
    });

    it('remaining pane should have parent', () => {
      expect(endState.panesById[2].parentId).toBe(1);
    });

  });

  describe('join one of two in row below root', () => {
    beforeEach(() => {
      startState = createLayout({
        rootId: 1,
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
            direction: directions.row,
            parentId: null,
            splitRatio: 1
          }),
          2: createPane({
            id: 2,
            childIds: [ 3, 4 ],
            isGroup: true,
            direction: null,
            parentId: 1,
            splitRatio: 0.75
          }),
          3: createPane({
            id: 3,
            childIds: [],
            isGroup: false,
            direction: null,
            parentId: 2,
            splitRatio: 0.75
          }),
          4: createPane({
            id: 4,
            childIds: [],
            isGroup: false,
            direction: null,
            parentId: 2,
            splitRatio: 0.75
          })
        }
      });

      action = join(3, 4);
      endState = reducer(startState, action);
    });

    it('parent should be deleted', () => {
      expect(endState.panesById[2]).toNotExist();
    });

    it('remaining should be added to grandparents children', () => {
      expect(endState.panesById[1].childIds).toEqual([ 0, 3 ]);
    });

    it('remaining parent should be previous grandparent', () => {
      expect(endState.panesById[3].parentId).toEqual(1);
    });

    it('removed pane should be deleted', () => {
      expect(endState.panesById[4]).toNotExist();
    });

    it('remaining pane should exist', () => {
      expect(endState.panesById[3]).toExist();
    });

    it('remaining pane should not have direction', () => {
      expect(endState.panesById[3].direction).toNotExist();
    });
  });
});
