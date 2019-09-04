import { Component } from 'react';
import ReactDOM from 'react-dom';
import memoize from 'memoize-one';

import Graph, { parseAnalysisSteps, parseBasicIOAnalysisSteps, DEFAULT_PARSING_OPTIONS } from 'react-workflow-viz';


import { STEPS as testFileProcessed4DNFI9WF1Y8W } from './testdata/provenance-file-processed-4DNFI9WF1Y8W';
import { STEPS as testExpSet4DNESXZ4FW4T } from './testdata/provenance-expset-4DNESXZ4FW4T';


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
        this.state = {
            currentDemoIdx : 0
        };
        this.memoized = {
            parseAnalysisSteps: memoize(parseAnalysisSteps),
            parseBasicIOAnalysisSteps: memoize(parseBasicIOAnalysisSteps)
        };
    }

    render(){
        const { testData } = this.props;
        const { currentDemoIdx } = this.state;
        const { title, description, steps } = testData[currentDemoIdx];
        const { nodes, edges } = this.memoized.parseAnalysisSteps(steps)
        //const 
        return (
            <div className="demo-app-container">
                <Graph {...{ nodes, edges }} />
            </div>
        );
    }

}


ReactDOM.render(
    <DemoApp />,
    document.getElementById("root")
);

