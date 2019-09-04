import { Component } from 'react';
import ReactDOM from 'react-dom';
import memoize from 'memoize-one';

import Graph, { parseAnalysisSteps, parseBasicIOAnalysisSteps, DEFAULT_PARSING_OPTIONS } from 'react-workflow-viz';


import { STEPS as testExpSet4DNESXZ4FW4T } from './testdata/provenance-expset-4DNESXZ4FW4T';


class DemoApp extends Component {

    static defaultProps = {
        "testData" : [
            {
                "title" : "Experiment Set - 4DNESXZ4FW4T",
                "description" : null,
                "steps" : testExpSet4DNESXZ4FW4T
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
                <Graph {...{ nodes, edges }} />;
            </div>
        );
    }

}


ReactDOM.render(
    <DemoApp />,
    document.getElementById("root")
);

