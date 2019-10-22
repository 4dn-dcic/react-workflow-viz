import { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import Graph, { GraphParser } from 'react-workflow-viz';


import { STEPS as testMinimal } from './testdata/minimal-cwl';
import { STEPS as testWorkflowBedToBedDB } from './testdata/workflow-bedtobeddb';
import { STEPS as testWorkflowAtacSeq } from './testdata/workflow-atac-seq';
import { STEPS as testFileProcessed4DNFI9WF1Y8W } from './testdata/provenance-file-processed-4DNFI9WF1Y8W';
import { STEPS as testFileProcessedGAPFIWCFWBCO } from './testdata/provenance-file-processed-GAPFIWCFWBCO';
import { STEPS as testExpset4DNESUJC9Y83 } from './testdata/provenance-expset-4DNESUJC9Y83';
import { STEPS as testExpset4DNES54YB6TQ } from './testdata/provenance-expset-4DNES54YB6TQ';



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
                "steps" : testFileProcessed4DNFI9WF1Y8W,
                "opts" : {}
            },
            {
                "name" : "File Processed - GAPFIWCFWBCO",
                "description" : null,
                "steps" : testFileProcessedGAPFIWCFWBCO,
                "opts" : {}
            },
            {
                "name" : "Experiment Set - 4DNES54YB6TQ",
                "description" : null,
                "steps" : testExpset4DNES54YB6TQ,
                "opts" : {}
            },
            {
                "name" : "Experiment Set - 4DNESUJC9Y83",
                "description" : null,
                "steps" : testExpset4DNESUJC9Y83,
                "opts" : {}
            },
            {
                "name" : "CWL Workflow - ATAC-SEQ",
                "description" : null,
                "steps" : testWorkflowAtacSeq,
                "opts" : workflowOpts
            },
            {
                "name" : "CWL Workflow - BED to BEDDB",
                "description" : null,
                "steps" : testWorkflowBedToBedDB,
                "opts" : workflowOpts
            },
            {
                "name" : "Minimal CWL",
                "description" : null,
                "steps" : testMinimal,
                "opts" : workflowOpts
            }
        ]
    };

    constructor(props){
        super(props);
        this.handleParsingOptChange = this.handleParsingOptChange.bind(this);
        this.handleRowSpacingTypeChange = this.handleRowSpacingTypeChange.bind(this);
        this.handleDemoChange = this.handleDemoChange.bind(this);
        this.state = {
            currentDemoIdx: 1,
            parsingOptions: {
                showReferenceFiles: true,
                showParameters: false,
                showIndirectFiles: false,
                parseBasicIO: false
            },
            rowSpacingType: "compact"
        };
    }

    handleParsingOptChange(evt){
        const key = evt.target.getAttribute("name");
        if (!key) return false;
        this.setState(function({ parsingOptions : prevOpts }){
            const nextOpts = { ...prevOpts, [key] : !prevOpts[key] };
            return { parsingOptions : nextOpts  };
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
        this.setState({ currentDemoIdx: nextIdx });
    }

    render(){
        const { testData } = this.props;
        const { currentDemoIdx, parsingOptions, rowSpacingType } = this.state;
        const { name, description, steps, opts: overrideOpts } = testData[currentDemoIdx];
        const fullParseOpts = { ...parsingOptions, ...overrideOpts };

        return (
            <div className="demo-app-container">
                <TestDataSelect {...{ currentDemoIdx, testData }} onChange={this.handleDemoChange} />
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
    const { currentDemoIdx, testData, onChange } = props;
    const { name: currDemoName } = testData[currentDemoIdx];
    const optionItems = testData.map(function({ name, steps, description }, idx){
        return <option name={idx} key={idx}>{ name }</option>;
    });
    return (
        <div className="row-spacing-type-container options-container">
            <label>
                <h5>Test Data</h5>
                <select onChange={onChange} value={currDemoName}>
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
