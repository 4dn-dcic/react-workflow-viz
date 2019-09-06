'use strict';

import React from 'react';
import PropTypes from 'prop-types';


export function DefaultDetailPane(props){
    const { selectedNode: node } = props;
    if (!node) return null;

    console.log("selected node", node);

    let type;
    if (node.nodeType === 'step'){
        type = 'Analysis Step';
    } else {
        type = node.ioType || node.nodeType;
    }

    const textContent = JSON.stringify(node.meta, null, 4);

    return (
        <div className="detail-pane">
            <h4>Create your own detail pane component and pass in a <code>renderDetailPane</code> prop (function) which returns it.</h4>
            <h5>Could add <code>display: flex</code> & related CSS styling to visualization container & pane to have detail pane show at left or right, if desired.</h5>
            <div className="detail-pane-body">
                <pre style={{ fontFamily : "monospace", whiteSpace: "pre-wrap" }}>{ textContent }</pre>
            </div>
        </div>
    );
}
DefaultDetailPane.propTypes = {
    'selectedNode' : PropTypes.oneOfType([ PropTypes.object, PropTypes.oneOf([null]) ])
};
DefaultDetailPane.defaultProps = {
    'selectedNode' : null
};
