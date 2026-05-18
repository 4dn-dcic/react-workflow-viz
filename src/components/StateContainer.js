'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import memoize from 'memoize-one';


const memoizedFindNode = memoize(function(nodes, name, nodeType, id=null){
    return _.find(nodes, function(n){
        if (n.name !== name) return false;
        if (n.nodeType !== nodeType) return false;
        if (id !== null && n.id !== id) return false;
        return true;
    });
});


export default class StateContainer extends React.PureComponent {

    static getDerivedStateFromProps(props, state){
        const stateUpdates = {};
        let hasUpdates = false;

        if (state.selectedNode){
            const foundNode = memoizedFindNode(
                props.nodes,
                state.selectedNode.name,
                state.selectedNode.nodeType,
                state.selectedNode.id || null
            );
            if (foundNode){
                stateUpdates.selectedNode = foundNode;
            } else {
                stateUpdates.selectedNode = null;
            }
            hasUpdates = true;
        }

        if (state.hoveredNode){
            const foundHovered = memoizedFindNode(
                props.nodes,
                state.hoveredNode.name,
                state.hoveredNode.nodeType,
                state.hoveredNode.id || null
            );
            stateUpdates.hoveredNode = foundHovered || null;
            hasUpdates = true;
        }

        return hasUpdates ? stateUpdates : null;
    }

    constructor(props){
        super(props);
        this.defaultOnNodeClick = this.defaultOnNodeClick.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleNodeMouseEnter = this.handleNodeMouseEnter.bind(this);
        this.handleNodeMouseLeave = this.handleNodeMouseLeave.bind(this);
        this.deselectNode = this.deselectNode.bind(this);
        this.state = {
            'selectedNode' : null,
            'hoveredNode' : null
        };
    }

    defaultOnNodeClick(node, selectedNode, evt){
        this.setState(function(prevState){
            if (prevState.selectedNode === node){
                return { 'selectedNode' : null };
            } else {
                return { 'selectedNode' : node };
            }
        });
    }

    handleNodeClick(node, evt){
        const { onNodeClick } = this.props;
        const { selectedNode } = this.state;
        if (typeof onNodeClick === 'function'){
            onNodeClick(node, selectedNode, evt);
        } else {
            this.defaultOnNodeClick(node, selectedNode, evt);
        }
    }

    deselectNode(){
        this.setState({ selectedNode: null });
    }

    handleNodeMouseEnter(node){
        this.setState({ hoveredNode: node || null });
    }

    handleNodeMouseLeave(){
        this.setState({ hoveredNode: null });
    }

    render(){
        const { children, renderDetailPane, ...passProps } = this.props;
        const { selectedNode, hoveredNode } = this.state;
        const { dimNonPathOnSelect = true } = this.props;
        let detailPane = null;
        if (typeof renderDetailPane === 'function'){
            detailPane = renderDetailPane(selectedNode, {
                ...this.props, deselectNode: this.deselectNode
            });
        }
        return (
            <div
                className="state-container"
                data-is-node-selected={!!(selectedNode)}
                data-is-node-hovered={!!(hoveredNode)}
                data-dim-non-path-on-select={dimNonPathOnSelect ? "true" : "false"}>
                {
                    React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            ...passProps,
                            ...this.state,
                            onNodeClick : this.handleNodeClick,
                            onNodeMouseEnter: this.handleNodeMouseEnter,
                            onNodeMouseLeave: this.handleNodeMouseLeave
                        })
                    )
                }
                { detailPane }
            </div>
        );
    }

}
