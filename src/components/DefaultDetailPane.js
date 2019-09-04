'use strict';

import React from 'react';
import PropTypes from 'prop-types';


export function DefaultDetailPane(props){
    const { selectedNode: node } = props;
    if (!node) return null;

    let type;
    if (node.nodeType === 'step'){
        type = 'Analysis Step';
    } else {
        type = node.ioType || node.nodeType;
    }

    const textContent = JSON.stringify(node.meta);

    return (
        <div className="detail-pane">
            <h5 className="text-500">
                { type }
            </h5>
            <h4 className="text-300">
                <span>{ node.name }</span>
            </h4>
            <div className="detail-pane-body">
                <textarea style={{ fontFamily : "monospace" }}>{ textContent }</textarea>
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
