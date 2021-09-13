# react-workflow-viz
React component for visualizing CWL-like workflows (and similar data).

This is in alpha/beta phase.


Is being used by HMS-DBMI in the [4DN Data Portal](https://data.4dnucleome.org/experiment-set-replicates/4DNESMU2MA2G/#graph-section) to show provenance of analytical pipeline runs.
Also being used in the CGAP (final name TDB) project for similar purposes.

Checkout the current demo at [unpkg.com/@hms-dbmi-bgm/react-workflow-viz/index.html](https://unpkg.com/@hms-dbmi-bgm/react-workflow-viz/index.html), which points to the index.html file in the distributable NPM package (and in this repo).

## Build demo

With a checkout of the repo:
```
npm install
npm run build
```

When it completes, load `file:///path-to-your-checkout/react-workflow-viz/index.html`.
New testdata won't show with `npm run build` unless is already present in unpkg/npm. For local development, do the following

### For Development

For local development (watches file, serves on localhost:8100), run `npm run dev`.


## Changelog
_Side Note -_ Is there a way to auto-generate a `CHANGELOG.md` file out of releases' content?

#### 2021-09-13 (v0.1.3, v0.1.4)
- Added couple of new demo files for development.

#### 2020-03-13 (v0.1.3, v0.1.4)
- Improvements in path plotting - do not diverge into separate paths unless necessary.
- Demo updates.
- Minor patch: move http-server to devDependencies.

#### 2020-01-21 (v0.1.2)
- Important glitch fixes, including typo and intersection counting.
- PROTOTYPE / NOT ENABLED: Reuse horizontal edge segments (to reduce # of lines; noise) if:
  - Segment is on same Y coordinate as previous segment (or source node, if first segment) _and_ has common source node. This prevents a path from a single node from prematuraly splitting into many separate paths.
  - Segment is leading to a common target node. This allows paths to converge if beneficial.
  - This could be better tested; perhaps reused segments should be treated differently in regard to intersections (at least excluded).

#### 2019-10-06 (v0.1.1)

- Improved ordering of terminal reference file input nodes.
  - Now compares distance of closest step that is being input into; those which go into further steps get pushed to bottom.
- For edges spanning more than one column gap, longer edges now get drawn/'traced' before shorter edges (experimental-ish).
- Including comments in ESM build output.


## Things to do

- Add & export a script/function to convert a unidirectional CWL into bidirectonal structure needed for this viz tool.
- Add complete example of CWL being visualized (including usage of script/function above to do so).
- Include way to show contents of testdata/setup code in demo index.html view/page.
- Documentation & reference
