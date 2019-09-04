import { Component } from 'react';
import ReactDOM from 'react-dom';
import memoize from 'memoize-one';

import Graph, { parseAnalysisSteps, parseBasicIOAnalysisSteps, DEFAULT_PARSING_OPTIONS } from 'react-workflow-viz';


import { STEPS as testFileProcessed4DNFI9WF1Y8W } from './testdata/provenance-file-processed-4DNFI9WF1Y8W';
//import { STEPS as testExpSet4DNESXZ4FW4T } from './testdata/provenance-expset-4DNESXZ4FW4T';


class DemoApp extends Component {

    static defaultProps = {
        "testData" : [
            {
                "title" : "File Processed - 4DNFI9WF1Y8W",
                "description" : null,
                "steps" : testFileProcessed4DNFI9WF1Y8W
            }
        ]
    };

    constructor(props){
        super(props);
        this.handleParsingOptChange = this.handleParsingOptChange.bind(this);
        this.handleRowSpacingTypeChange = this.handleRowSpacingTypeChange.bind(this);
        this.handleChangeBasicIO = this.handleChangeBasicIO.bind(this);
        this.state = {
            currentDemoIdx: 0,
            parsingOptions: {
                showReferenceFiles: true,
                showParameters: true,
                showIndirectFiles: false
            },
            rowSpacingType: "compact",
            showBasicIO: false
        };
        this.memoized = {
            parseAnalysisSteps: memoize(parseAnalysisSteps),
            parseBasicIOAnalysisSteps: memoize(parseBasicIOAnalysisSteps)
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
            "Stretched" : "wide"
        };
        const nextValue = evt.target.value && valMap[evt.target.value];
        if (!nextValue) return false;
        this.setState({ rowSpacingType: nextValue });
    }

    handleChangeBasicIO(evt){
        this.setState(function({ showBasicIO }){
            return { showBasicIO : !showBasicIO  };
        });
    }

    render(){
        const { testData } = this.props;
        const { currentDemoIdx, parsingOptions, rowSpacingType, showBasicIO } = this.state;
        const { title, description, steps } = testData[currentDemoIdx];
        const parseMethod = showBasicIO ? this.memoized.parseBasicIOAnalysisSteps : this.memoized.parseAnalysisSteps;
        const { nodes, edges } = parseMethod(steps, parsingOptions);

        return (
            <div className="demo-app-container">
                <ParsingOptsCheckboxes {...parsingOptions} showBasicIO={showBasicIO}
                    onChange={this.handleParsingOptChange} onChangeBasicIO={this.handleChangeBasicIO} />
                <RowSpacingTypeSelect rowSpacingType={rowSpacingType} onChange={this.handleRowSpacingTypeChange} />
                <Graph {...{ nodes, edges, rowSpacingType }} />
            </div>
        );
    }

}

function RowSpacingTypeSelect(props){
    const { rowSpacingType, onChange } = props;
    const titleMap = {
        "compact" : "Centered",
        "stacked" : "Stacked",
        "wide" : "Stretched"
    };
    return (
        <div className="row-spacing-type-container options-container">
            <label>
                <h5>Row Spacing Type</h5>
                <select onChange={onChange} value={titleMap[rowSpacingType]}>
                    <option name="compact">Centered</option>
                    <option name="stacked">Stacked</option>
                    <option name="wide">Stretched</option>
                </select>
            </label>
        </div>
    );
}

function ParsingOptsCheckboxes(props){
    const { showReferenceFiles, showParameters, showIndirectFiles, showBasicIO, onChange, onChangeBasicIO } = props;
    return (
        <div className="parsing-options-container options-container">
            <h5>Parsing Options</h5>
            <label>
                <input type="checkbox" name="showReferenceFiles" checked={showReferenceFiles} onChange={onChange} />
                Show Reference Files
            </label>
            <label>
                <input type="checkbox" name="showParameters" checked={showParameters} onChange={onChange} />
                Show Parameters
            </label>
            <label>
                <input type="checkbox" name="showIndirectFiles" checked={showIndirectFiles} onChange={onChange} />
                Show Indirect Files
            </label>
            <label>
                <input type="checkbox" name="showBasicIO" checked={showBasicIO} onChange={onChangeBasicIO} />
                Show Terminal I/O
            </label>
        </div>
    );
}


ReactDOM.render(
    <DemoApp />,
    document.getElementById("root")
);

