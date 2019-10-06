# react-workflow-viz
React component for visualizing CWL-like workflows (and similar data).

This is in alpha/beta phase.


Is being used by HMS-DBMI in the [4DN Data Portal](https://data.4dnucleome.org/experiment-set-replicates/4DNESMU2MA2G/#graph-section) to show provenance of analytical pipeline runs.
Also being used in the CGAP (final name TDB) project for similar purposes.
Checkout the current demo.

## Changelog
_Side Note -_ Is there a way to auto-generate a `CHANGELOG.md` file out of releases' content?

#### 2012-10-06

- Improved ordering of terminal reference file input nodes.
  - Now compares distance of closest step that is being input into; those which go into further steps get pushed to bottom.
- For edges spanning more than one column gap, longer edges now get drawn/'traced' before shorter edges (experimental-ish).
- Including comments in ESM build output.


## Things to do before NPM release

- Add & export a script/function to convert a unidirectional CWL into bidirectonal structure needed for this viz tool.
- Add complete example of CWL being visualized (including usage of script/function above to do so).
- Include way to show contents of testdata/setup code in demo index.html view/page.
- Documentation & reference
