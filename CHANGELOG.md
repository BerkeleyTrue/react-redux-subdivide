<a name="0.0.2"></a>
## [0.0.2](https://github.com/berkeleyTrue/react-redux-subdivide/compare/v0.5.0...v0.0.2) (2017-04-05)

### Bug Fixes

* **components:** add jsx to component imports ([b739127](https://github.com/berkeleyTrue/react-redux-subdivide/commit/b739127))
* **components:** Divider pressedAction should have the correct id key ([bd6daf8](https://github.com/berkeleyTrue/react-redux-subdivide/commit/bd6daf8))
* **components:** divider style mix up ([8983eae](https://github.com/berkeleyTrue/react-redux-subdivide/commit/8983eae))
* **layout:** Layout now splits and dividers move correctly ([569a233](https://github.com/berkeleyTrue/react-redux-subdivide/commit/569a233))
* **redux:** divider epic should start on split as well ([2aa70d5](https://github.com/berkeleyTrue/react-redux-subdivide/commit/2aa70d5))
* **redux:** Divider move typo ([b644ba0](https://github.com/berkeleyTrue/react-redux-subdivide/commit/b644ba0))
* **redux:** mousemove logic ([8270c75](https://github.com/berkeleyTrue/react-redux-subdivide/commit/8270c75))
* **redux:** normalize x/y accumate ([9530d23](https://github.com/berkeleyTrue/react-redux-subdivide/commit/9530d23))
* **redux:** only normalize state when panesById has changed ([37f2133](https://github.com/berkeleyTrue/react-redux-subdivide/commit/37f2133))
* **redux:** only run second pass on state change ([1f1262a](https://github.com/berkeleyTrue/react-redux-subdivide/commit/1f1262a))
* Fix overlay ([2b25af9](https://github.com/berkeleyTrue/react-redux-subdivide/commit/2b25af9))
* prepublishOnly script did not build ([ae9a522](https://github.com/berkeleyTrue/react-redux-subdivide/commit/ae9a522))
* **redux:** selector now pulls state from namespace ([3ae0243](https://github.com/berkeleyTrue/react-redux-subdivide/commit/3ae0243))
* **redux:** specify radix for parseint ([00569c4](https://github.com/berkeleyTrue/react-redux-subdivide/commit/00569c4))
* **redux:** Split with none root and split in same direction ([e69623c](https://github.com/berkeleyTrue/react-redux-subdivide/commit/e69623c))
* Update api ([cbfc936](https://github.com/berkeleyTrue/react-redux-subdivide/commit/cbfc936))
* Use absolute vs additive divider positioning ([2398c14](https://github.com/berkeleyTrue/react-redux-subdivide/commit/2398c14))
* prepublishOnly script did not build ([59b8558](https://github.com/berkeleyTrue/react-redux-subdivide/commit/59b8558))


### Features

* Get src code in a workable state ([f737900](https://github.com/berkeleyTrue/react-redux-subdivide/commit/f737900))
* move window resize logic into redux-observable ([d141ecb](https://github.com/berkeleyTrue/react-redux-subdivide/commit/d141ecb))
* Simplify main Subdivide component ([d54273d](https://github.com/berkeleyTrue/react-redux-subdivide/commit/d54273d))
* **app:** Complex logic is now all in epics ([b77f7a8](https://github.com/berkeleyTrue/react-redux-subdivide/commit/b77f7a8))
* **dev:** Upgrade webpack to 2.0, use dev server ([f553d10](https://github.com/berkeleyTrue/react-redux-subdivide/commit/f553d10))
* **dividers:** Co-locate selectors in redux file ([d084302](https://github.com/berkeleyTrue/react-redux-subdivide/commit/d084302))
* **reducer:** refactor immmutable out of reducer ([ad95b96](https://github.com/berkeleyTrue/react-redux-subdivide/commit/ad95b96))
* **test:** test break on first fail ([55949ba](https://github.com/berkeleyTrue/react-redux-subdivide/commit/55949ba))


### BREAKING CHANGES

* Change public api
* Removes automount of redux store. Now requires redux in context
