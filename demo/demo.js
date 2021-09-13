import { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import url from 'url';
import { default as packageJSON } from './../package.json';

// Loaded on index.html, defined as an external in webpack.config.demo.js
import Graph, { GraphParser } from 'react-workflow-viz';

// eslint-disable-next-line no-undef
const BASE_HREF = (typeof BUILDTYPE === "string" && BUILDTYPE === "development") ? "http://localhost:8100/demo/testdata/" : `https://unpkg.com/@hms-dbmi-bgm/react-workflow-viz@${packageJSON.version}/demo/testdata/`

const workflowOpts = {
    //"showReferenceFiles": true,
    "showIndirectFiles": true
};

class DemoApp extends Component {

    static defaultProps = {
        "testData" : [
            {
                "name" : "File Processed - 4DNFI9WF1Y8W",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "provenance-file-processed-4DNFI9WF1Y8W.json"),
                "opts" : {}
            },
            {
                "name" : "File Processed - GAPFIWCFWBCO",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "provenance-file-processed-GAPFIWCFWBCO.json"),
                "opts" : {}
            },
            {
                "name" : "File Processed - GAPFIRPF7X1K",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "provenance-file-processed-GAPFIRPF7X1K.json"),
                "opts" : {}
            },
            {
                "name" : "Experiment Set - 4DNES54YB6TQ",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "provenance-expset-4DNES54YB6TQ.json"),
                "opts" : {}
            },
            
            {
                "name" : "Experiment Set - 4DNESUJC9Y83",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "provenance-expset-4DNESUJC9Y83.json"),
                "opts" : {}
            },
            {
                "name" : "CWL Workflow - ATAC-SEQ",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "workflow-atac-seq.json"),
                "opts" : workflowOpts
            },
            {
                "name" : "CWL Workflow - BED to BEDDB",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "workflow-bedtobeddb.json"),
                "opts" : workflowOpts
            },
            {
                "name" : "WorkflowRunAWSEM (hi-c-processing-bam) - Previous Version (no scatter)",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "previous-hi-c-worfklowrunawsem.json"),
                "opts" : workflowOpts
            },
            {
                "name" : "WorkflowRunAWSEM (hi-c-processing-bam) - Next Version (scatter)",
                "description" : null,
                "href" : url.resolve(BASE_HREF, "for-development-hi-c-workflowrunawsem.json"),
                "opts" : workflowOpts
            }
        ]
    };

    constructor(props){
        super(props);
        this.handleParsingOptChange = this.handleParsingOptChange.bind(this);
        this.handleRowSpacingTypeChange = this.handleRowSpacingTypeChange.bind(this);
        this.handleDemoChange = this.handleDemoChange.bind(this);
        this.loadDemoData = this.loadDemoData.bind(this);
        this.state = {
            currentDemoIdx: 0,
            parsingOptions: {
                showReferenceFiles: true,
                showParameters: false,
                showIndirectFiles: false,
                parseBasicIO: false
            },
            loadedSteps: {},
            rowSpacingType: "compact"
        };
    }

    componentDidMount(){
        this.loadDemoData();
    }

    handleParsingOptChange(evt){
        const key = evt.target.getAttribute("name");
        if (!key) return false;
        this.setState(function({ parsingOptions : prevOpts }){
            const nextOpts = { ...prevOpts, [key] : !prevOpts[key] };
            return { parsingOptions : nextOpts };
        });
    }

    handleRowSpacingTypeChange(evt, v){
        const valMap = {
            // todo - rename internal stuff
            "Centered" : "compact",
            "Stacked" : "stacked",
            "Spread" : "wide"
        };
        const nextValue = evt.target.value && valMap[evt.target.value];
        if (!nextValue) return false;
        this.setState({ rowSpacingType: nextValue });
    }

    handleDemoChange(evt){
        const { testData } = this.props;
        const nextValue = evt.target.value;
        const nextIdx = nextValue && _.findIndex(testData, { name: nextValue });
        if (nextIdx === -1) return false;
        this.setState({ currentDemoIdx: nextIdx }, this.loadDemoData);
    }

    loadDemoData(){
        const { testData } = this.props;
        const { currentDemoIdx, loadedSteps } = this.state;
        const currDemoInfo = testData[currentDemoIdx];
        const { name, href } = currDemoInfo;

        const existingSteps = currDemoInfo.steps || loadedSteps[name];

        if (!Array.isArray(existingSteps)) {
            this.setState({ loadingSteps: true }, ()=>{
                window.fetch(url.resolve(window.location.href, href)).then((resp)=>{
                    return resp.json();
                }).then((resp)=>{
                    this.setState(function({ loadedSteps: prevSteps }){
                        return {
                            loadedSteps: { ...prevSteps, [name] : resp },
                            loadingSteps: false
                        };
                    });
                });
            });
        }

    }

    render(){
        const { testData } = this.props;
        const { currentDemoIdx, parsingOptions, rowSpacingType, loadedSteps, loadingSteps } = this.state;
        const { name, description, steps: preloadedSteps, opts: overrideOpts } = testData[currentDemoIdx];
        const fullParseOpts = { ...parsingOptions, ...overrideOpts };

        const steps = preloadedSteps || loadedSteps[name];

        return (
            <div className="demo-app-container">
                <TestDataSelect {...{ currentDemoIdx, testData, loadingSteps }} onChange={this.handleDemoChange} />
                <ParsingOptsCheckboxes {...parsingOptions} dataOpts={overrideOpts}
                    onChange={this.handleParsingOptChange} onChangeBasicIO={this.handleChangeBasicIO} />
                <RowSpacingTypeSelect rowSpacingType={rowSpacingType} onChange={this.handleRowSpacingTypeChange} />
                <GraphParser parsingOptions={fullParseOpts} parentItem={{ name }} steps={steps}>
                    <Graph rowSpacingType={rowSpacingType} minimumHeight={300} />
                </GraphParser>
            </div>
        );
    }

}


function TestDataSelect(props){
    const { currentDemoIdx, testData, onChange, loadingSteps = false } = props;
    const { name: currDemoName } = testData[currentDemoIdx];
    const optionItems = testData.map(function({ name, steps, description }, idx){
        return <option name={idx} key={idx}>{ name }</option>;
    });
    return (
        <div className="row-spacing-type-container options-container">
            <label>
                <h5>Test Data { loadingSteps ? <small>(loading...)</small> : null }</h5>
                <select onChange={onChange} value={currDemoName} disabled={loadingSteps}>
                { optionItems }
                </select>
            </label>
        </div>
    );
}


function RowSpacingTypeSelect(props){
    const { rowSpacingType, onChange } = props;
    const titleMap = {
        "compact" : "Centered",
        "stacked" : "Stacked",
        "wide" : "Spread"
    };
    return (
        <div className="row-spacing-type-container options-container">
            <label>
                <h5>Row Spacing Type</h5>
                <select onChange={onChange} value={titleMap[rowSpacingType]}>
                    <option name="compact">Centered</option>
                    <option name="stacked">Stacked</option>
                    <option name="wide">Spread</option>
                </select>
            </label>
        </div>
    );
}

function ParsingOptsCheckboxes(props){
    const { showReferenceFiles, showParameters, showIndirectFiles, parseBasicIO, onChange, dataOpts } = props;
    return (
        <div className="parsing-options-container options-container">
            <h5>Parsing Options</h5>
            <label>
                <input type="checkbox" name="showReferenceFiles"
                    checked={dataOpts['showReferenceFiles'] || showReferenceFiles}
                    onChange={onChange}
                    disabled={typeof dataOpts['showReferenceFiles'] !== 'undefined'} />
                Show Reference Files
            </label>
            <label>
                <input type="checkbox" name="showParameters"
                    checked={dataOpts['showParameters'] || showParameters}
                    onChange={onChange}
                    disabled={typeof dataOpts['showParameters'] !== 'undefined'} />
                Show Parameters
            </label>
            <label>
                <input type="checkbox" name="showIndirectFiles"
                    checked={dataOpts['showIndirectFiles'] || showIndirectFiles}
                    onChange={onChange}
                    disabled={typeof dataOpts['showIndirectFiles'] !== 'undefined'} />
                Show Indirect Files
            </label>
            <label>
                <input type="checkbox" name="parseBasicIO"
                    checked={dataOpts['parseBasicIO'] || parseBasicIO}
                    onChange={onChange}
                    disabled={typeof dataOpts['parseBasicIO'] !== 'undefined'} />
                Show Terminal I/O
            </label>
        </div>
    );
}


ReactDOM.render(<DemoApp />, document.getElementById("root"));

