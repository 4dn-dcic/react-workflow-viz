'use strict';

import React from 'react';
import _ from 'underscore';
import memoize from 'memoize-one';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Node from './Node';


export default class NodesLayer extends React.PureComponent {

    static sortedNodes(nodes){
        // Sort nodes so on updates, they stay in same(-ish) order and can transition.
        return _.sortBy(nodes.slice(0), 'id');
    }

    static countInActiveContext(nodes){
        return _.reduce(nodes, function(m,n){ return ( n.isCurrentContext ? ++m : m ); }, 0);
    }

    static lastActiveContextNode(nodes){
        return _.sortBy(_.filter(nodes, function(n){ return n.isCurrentContext; }), 'column' ).reverse()[0];
    }

    static defaultProps = {
        'onNodeMouseEnter' : null,
        'onNodeMouseLeave' : null,
        'onNodeClick' : null
    };

    constructor(props){
        super(props);
        this.memoized = {
            sortedNodes: memoize(NodesLayer.sortedNodes),
            countInActiveContext: memoize(NodesLayer.countInActiveContext),
            lastActiveContextNode: memoize(NodesLayer.lastActiveContextNode)
        };
    }

    renderNodeElements(){
        if (!this.props.scrollContainerWrapperMounted){
            return null;
        }
        const { nodes, onNodeMouseEnter, onNodeMouseLeave, onNodeClick, nodeClassName } = this.props;
        const sortedNodes = this.memoized.sortedNodes(nodes);
        const countInActiveContext = this.memoized.countInActiveContext(sortedNodes);
        const lastActiveContextNode = countInActiveContext === 0 ? null : this.memoized.lastActiveContextNode(sortedNodes);

        return _.map(sortedNodes, (node, nodeIndex) => {
            const nodeProps = _.extend(
                _.omit(this.props, 'children', 'nodes', 'width', 'innerWidth', 'outerWidth', 'windowWidth'),
                {
                    node, countInActiveContext, lastActiveContextNode,
                    'onMouseEnter'  : onNodeMouseEnter && onNodeMouseEnter.bind(onNodeMouseEnter, node),
                    'onMouseLeave'  : onNodeMouseLeave && onNodeMouseLeave.bind(onNodeMouseLeave, node),
                    'onClick'       : onNodeClick && onNodeClick.bind(onNodeClick, node),
                    'key'           : node.id || node.name || nodeIndex,
                    'className'     : nodeClassName
                }
            );
            return (
                <CSSTransition classNames="workflow-node-transition" unmountOnExit timeout={500} key={nodeProps.key}>
                    <Node {...nodeProps} />
                </CSSTransition>
            );
        });

    }

    render(){
        var { innerMargin, innerWidth, outerHeight, contentWidth } = this.props,
            fullWidth = innerWidth + innerMargin.left + innerMargin.right,
            layerStyle = { 'width' : Math.max(contentWidth, fullWidth), 'height' : outerHeight };

        return (
            <div className="nodes-layer-wrapper" style={layerStyle}>
                <div className="nodes-layer" style={layerStyle}>
                    <TransitionGroup component={null}>{ this.renderNodeElements() }</TransitionGroup>
                </div>
            </div>
        );
    }

}
