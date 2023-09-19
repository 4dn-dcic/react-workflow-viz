# react-workflow-viz
React component for visualizing CWL-like workflows (and similar data).

This repository is in alpha/beta phase, and is provided with very, very limited support to folks outside of HMS. Hopefully, in the future this will change!

Currently, this package is being used by HMS-DBMI in the [4DN Data Portal](https://data.4dnucleome.org/experiment-set-replicates/4DNESMU2MA2G/#graph-section) to show provenance of analytical pipeline runs.
Also being used in [CGAP](https://cgap.hms.harvard.edu) for similar purposes.

Check out a live demo at [unpkg.com/@hms-dbmi-bgm/react-workflow-viz/index.html](https://unpkg.com/@hms-dbmi-bgm/react-workflow-viz/index.html). _Note: This link points to the index.html file in the distributable NPM package (and in this repo)._

[![Gif of CWL Workflow Viz](https://i.gyazo.com/0c5e73105b1f284c16a9cca03ec866ed.gif)](https://unpkg.com/@hms-dbmi-bgm/react-workflow-viz/index.html)

<br/>
<br/>

## Try Demo Locally

With a local clone and checkout of the repo:
```
npm install
npm run build
```

When it completes, load `file:///path-to-your-checkout/react-workflow-viz/index.html`.

_Note: New test data won't show with `npm run build` unless it is already present in unpkg/npm. Similarly, if a new NPM release has not been made to match the current local version specified in `package-lock.json` and `package.json`, no data will load at file:/// path. Run local development server and test that way instead (see below)._

<br/>

### For Contributors/Collaborators
For local development, run `npm run dev` (watches `/src/` files, serves on `localhost:8100`).

<br/>
<br/>

## Changelog
Changelog has been moved to `CHANGELOG.md` file in [repo's root directory](https://github.com/4dn-dcic/react-workflow-viz/blob/master/CHANGELOG.md). Please check there for updates.

<br/>
<br/>

## Things to do

- Add & export a script/function to convert a unidirectional CWL into bidirectonal structure needed for this viz tool.
- Add complete example of CWL being visualized (including usage of script/function above to do so).
- Include way to show contents of testdata/setup code in demo index.html view/page.
- Documentation & reference
