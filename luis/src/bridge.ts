import { TestGroup, Test, Snapshot, StateModel, mapBridgeToState } from './index';

export type Impl = () => void;

export type Map<T> = { [name: string]: T };

export type Snapshots = Map<Map<string>>;

export function buildBridge(
  testData: jest.AggregatedResult = {} as any,
  snapshots: Snapshots = {}
) {
  (global as any).jest = { fn: () => {} };

  mapBridgeToState(state => {
    // hide top menus if we have no test results
    if (!Array.isArray(testData.testResults) || testData.testResults.length === 0) {
      state.hideMenus(true);
    }

    // create new bridge
    createBridge(state, testData, snapshots);
  });
}

function clean(message: string) {
  message = message.replace(/\u001b/g, '');
  message = message.replace(/\[\d+m/g, '');
  return message;
}

function addTests(
  state: StateModel,
  group: TestGroup,
  testData: jest.AggregatedResult,
  snapshots: Snapshots
) {
  // check if we have already processed this group
  // if (group.tests && group.tests.length) {
  //   return;
  // }

  // add info
  group.passingTests = 0;
  group.failingTests = 0;

  // browse all test results and find test belonging to this group
  const path = group.simplePath;

  if (!testData.testResults) {
    return;
  }

  for (let suite of testData.testResults) {
    const suiteSnapshots = snapshots[suite.testFilePath] || {};
    const keys = Object.getOwnPropertyNames(suiteSnapshots);

    for (let test of suite.testResults) {
      const testPath = test.ancestorTitles.join(' ');
      if (testPath == path) {
        const t = new Test(test.title, group, null);
        t.duration = test.duration || 1;
        t.endTime = test.duration || 1;

        if (test.status === 'pending') {
          let previous = state.liveRoot.findTest(t.name, t.parent.name);

          if (previous) {
            if (previous.error) {
              group.failingTests++;
            } else {
              group.passingTests++;
            }
            group.tests.push(previous);
            continue;
          }
        }

        if (test.status == 'passed') {
          group.passingTests++;
        } else if (test.status == 'failed') {
          group.failingTests++;
        }

        // add failures
        if (test.failureMessages.length) {
          // disect equality
          let message = clean(test.failureMessages[0]);

          let expected = null;
          let actual = null;

          // equality matcher
          if (
            message.indexOf('expect(received).toEqual(expected)') > 0 || // jest
            message.indexOf('+ Received') > 0 // chai
          ) {
            expected = '';
            actual = '';

            let lines = message.split('\n');
            lines = lines.slice(
              lines.findIndex(l => !!l.match(/\+ Received/) || !!l.match(/\+ expected \- actual/)) +
                2
            );
            lines = lines.slice(0, lines.findIndex(l => !!l.match('^    at')));

            for (let line of lines) {
              if (line[0] === '-') {
                expected += '  ' + line.substring(2) + '\n';
              } else if (line[0] === '+') {
                actual += '  ' + line.substring(2) + '\n';
              } else {
                expected += line + '\n';
                actual += line + '\n';
              }
            }
          }

          // snapshot matcher
          if (
            message.indexOf('expect(value).toMatchSnapshot()') > 0 ||
            message.indexOf('Snapshots do not match') > 0
          ) {
            const matchingSnapshots = keys.filter(k => k.indexOf(test.fullName) >= 0);
            if (matchingSnapshots.length) {
              let original = suiteSnapshots[matchingSnapshots[0]].trim();
              let lines = message.split('\n');

              lines = lines.slice(lines.findIndex(l => !!l.match(/\+ Received/)) + 2);
              lines = lines.slice(0, lines.findIndex(l => !!l.match('^    at')));

              let originalLines = original.split('\n');
              let current = [];
              let index = 0;

              // console.log(lines[0])

              for (let line of lines) {
                let both = line.match(/^@@ \-(\d+)/);

                if (line.match('^    at')) {
                  break;
                }

                if (both) {
                  let end = parseInt(both[1]);
                  // console.log(end);
                  for (let i = index; i < end - 1; i++) {
                    current.push(originalLines[i]);
                  }
                  index = end - 1;
                  continue;
                }

                let m = line.match(/^\s*(\+|\-)/);

                if (m) {
                  let d = (m && m[1]) || '';
                  let rest = line.replace(d, '');
                  if (d !== '+') {
                    index++;
                  } else {
                    current.push(rest);
                  }
                } else {
                  current.push(originalLines[index]);
                  index++;
                }
              }
              expected = original;
              actual = current.join('\n');
            }
          }

          let error = new Error(test.failureMessages[0]) as any;
          error.expected = expected;
          error.actual = actual;
          t.error = error;
        }

        // add snapshots
        const matchingSnapshots = keys.filter(k => k.indexOf(test.fullName) >= 0);

        if (matchingSnapshots.length) {
          let index = 1;
          t.snapshots.replace(
            matchingSnapshots.map(m => {
              let expected = suiteSnapshots[m].trim();
              if (expected) {
                expected = expected.replace(/className=/g, 'class=');
                expected = expected.replace(/<(\w+)([^>]+)\/>/gm, '<$1$2></$1>');
              }
              let actual = t.error ? t.error.actual : suiteSnapshots[m];
              if (actual) {
                actual = actual.trim();
                actual = actual.replace(/className=/g, 'class=');
                actual = actual.replace(/<(\w+)([^>]+)\/>/gm, '<$1$2></$1>');
              }

              let snapshotName = (m.match(new RegExp(test.fullName + '\\s+\\d+'))
                ? `Snapshot ${index++}`
                : m.replace(test.fullName, '')
              )
                .replace(/\b1$/, '') // remove the trailing number for the first snapshot
                .replace(/^:\s+/, ''); // with custom names snapshot name starts with ': '

              return new Snapshot({
                current: actual,
                name: snapshotName,
                originalName: m,
                matching: true,
                test: t,
                expected
              });
            })
          );
        }

        group.tests.push(t);
      }
    }
  }
}

export function createBridge(
  state: StateModel,
  testData: jest.AggregatedResult,
  snapshots: Snapshots
) {
  const glob: any = global;

  state.liveRoot.groups = [];
  state.liveRoot.passingTests = testData.numPassedTests;
  state.liveRoot.failingTests = testData.numFailedTests;

  glob.addStory = function(story: any) {
    state.currentGroup.initStory(story);
  };

  glob.describe = function(name: string, impl: Impl) {
    const group = state.currentGroup.getGroup(name, state);
    const parent = group.parent;
    state.currentGroup = group;

    try {
      const story: any = impl();
      if (story) {
        state.currentGroup.initStory(story);
      }
    } finally {
      state.currentGroup = parent;
    }

    addTests(state, group, testData, snapshots);

    // sort
    parent.groups.sort((a, b) => (a.name < b.name ? -1 : 1));
    group.tests.sort((a, b) => (a.name < b.name ? -1 : 1));
  };

  glob.xit = function() {};

  glob.xdescribe = function() {};

  glob.it = function(_name: string, _impl: Impl) {};

  glob.itMountsAnd = function(_name: string, _impl: Impl) {};

  glob.itMountsContainerAnd = function(_name: string, _impl: Impl) {};

  glob.before = function(_impl: Impl) {};

  glob.beforeAll = function(_impl: Impl) {};

  glob.beforeEach = function(_impl: Impl) {};

  glob.after = function(_impl: Impl) {};

  glob.afterAll = function(_impl: Impl) {};

  glob.afterEach = function(_impl: Impl) {};
}

declare global {
  function storyOf<T extends StoryConfig>(
    name: string,
    config: T,
    implementation?: (params: T) => void
  ): void;
}
