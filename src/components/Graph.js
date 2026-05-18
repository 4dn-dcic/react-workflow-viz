'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import * as d3 from 'd3';
import memoize from 'memoize-one';

import StateContainer from './StateContainer';
import ScrollContainer from './ScrollContainer';
import NodesLayer from './NodesLayer';
import EdgesLayer from './EdgesLayer';
import { DefaultDetailPane } from './DefaultDetailPane';
import { DefaultNodeElement } from './Node';
import { ScaleController, ScaleControls } from './ScaleController';
import { requestAnimationFrame, cancelAnimationFrame, roundScaled } from '../utilities'

import { parseAnalysisSteps, parseBasicIOAnalysisSteps } from './parsing-functions';

/**
 * Primary/entry component for the Workflow graph.
 *
 * @class Graph
 * @prop {Object[]}     nodes                   Array of node objects to plot. Both nodes and edges can be generated from a CWL-like structure using static functions, including the provided 'parseAnalysisSteps'. See propTypes in class def below for object structure.
 * @prop {Object[]}     edges                   Array of edge objects to plot. See propTypes in class def below for object structure.
 * @prop {function}     renderNodeElement       Function to render out own custom Node Element. Accepts two params - 'node' and 'props' (of graph).
 * @prop {function?}    renderDetailPane        Function to render out own custom Detail Pane. Accepts two params - 'selectedNode' and 'props' (of graph). Pass in null to perform your own logic in onNodeClick.
 * @prop {function}     [onNodeClick]           A function to be executed each time a node is clicked. 'this' will refer to internal statecontainer. Should accept params: {Object} 'node', {Object|null} 'selectedNode', and {MouseEvent} 'evt'. By default, it changes internal state's selectedNode. You should either disable props.checkHrefForSelectedNode -or- change href in this function.
 * @prop {function}     [isNodeDisabled]        Function which accepts a 'node' object and returns a boolean.
 * @prop {Object}       [innerMargin={top : 20, bottom: 48, left: 15, right: 15}]     Provide this object, containing numbers for 'top', 'bottom', 'left', and 'right', if want to adjust chart margins.
 * @prop {boolean}      [pathArrows=true]       Whether to display arrows at the end side of edges.
 * @prop {number}       [columnSpacing=56]      Adjust default spacing between columns, where edges are drawn.
 * @prop {number}       [columnWidth=150]       Adjust width of columns, where nodes are drawn.
 * @prop {number}       [rowSpacing=56]         Adjust vertical spacing between node centers (NOT between their bottom/top).
 * @prop {function}     [nodeTitle]             Optional function to supply to get node title, before is passed to visible Node element. Useful if want to display some meta sub-property rather than technical title.
 */
export default class Graph extends React.Component {

    static propTypes = {
        'isNodeDisabled'    : PropTypes.func,
        'innerMargin'       : PropTypes.shape({
            'top'               : PropTypes.number.isRequired,
            'bottom'            : PropTypes.number.isRequired,
            'left'              : PropTypes.number.isRequired,
            'right'             : PropTypes.number.isRequired
        }).isRequired,
        'renderNodeElement' : PropTypes.func.isRequired,
        'renderDetailPane'  : PropTypes.func.isRequired,
        'nodes'             : PropTypes.arrayOf(PropTypes.shape({
            'column'            : PropTypes.number.isRequired,
            'name'              : PropTypes.string.isRequired,
            'nodeType'          : PropTypes.string.isRequired,
            'ioType'            : PropTypes.string,
            'id'                : PropTypes.string,  // Optional unique ID if node names might be same.
            'outputOf'          : PropTypes.object,  // Unused currently
            'inputOf'           : PropTypes.arrayOf(PropTypes.object),  // Unused currently
            'description'       : PropTypes.string,
            'meta'              : PropTypes.oneOfType([
                PropTypes.object,
                PropTypes.shape({
                    'target' : PropTypes.arrayOf(PropTypes.shape({
                        'name' : PropTypes.string.isRequired,
                        'type' : PropTypes.string.isRequired,
                        'step' : PropTypes.string
                    }))
                })
            ])
        })).isRequired,
        'edges'             : PropTypes.arrayOf(PropTypes.shape({
            'source'            : PropTypes.object.isRequired,
            'target'            : PropTypes.object.isRequired,
            'capacity'          : PropTypes.string
        })).isRequired,
        'nodeTitle'         : PropTypes.func,
        'rowSpacingType'    : PropTypes.oneOf([ 'compact', 'wide', 'stacked' ]),
        //scale
        'showZoomControls': PropTypes.bool,
        'scale': PropTypes.number,
        'minScale': PropTypes.number,
        'maxScale': PropTypes.number
        ,
        'zoomControlsPortalSelector': PropTypes.string
    };

    static defaultProps = {
        'height'        : null, // Unused, should be set to nodes count in highest column * rowSpacing + innerMargins.
        'width'         : null,
        'columnSpacing' : 100,
        'columnWidth'   : 150,
        'rowSpacing'    : 80,
        'rowSpacingType': 'compact',
        'pathArrows'    : true,
        'renderDetailPane' : function(selectedNode, props){
            return <DefaultDetailPane {...props} selectedNode={selectedNode} />;
        },
        'renderNodeElement' : function(node, props){
            return <DefaultNodeElement {...props} node={node} />;
        },
        'onNodeClick'   : null, // Use StateContainer.defaultOnNodeClick
        'innerMargin'   : {
            'top' : 80,
            'bottom' : 80,
            'left' : 40,
            'right' : 40
        },
        'minimumHeight' : 75,
        'edgeStyle' : 'bezier',
        'isNodeCurrentContext' : function(node){
            return false;
        },
        'nodeClassName' : function(node){ return ''; },
        'nodeEdgeLedgeWidths' : [3,5],
        //scale
        'showZoomControls': true,
        'scale': 1,
        'minScale': 0.50,
        'maxScale': 1.50
        ,
        'zoomControlsPortalSelector': null
    };

    static getHeightFromNodes(nodes, nodesPreSortFxn, rowSpacing){
        // Run pre-sort fxn, e.g. to manually pre-arrange nodes into different columns.
        if (typeof nodesPreSortFxn === 'function'){
            nodes = nodesPreSortFxn(nodes.slice(0));
        }
        return Math.max(
            _(nodes).chain()
                .groupBy('column')
                .pairs()
                .reduce(function(maxCount, nodeSet){
                    return Math.max(nodeSet[1].length, maxCount);
                }, 0)
                .value() * (rowSpacing) - rowSpacing
        );
    }

    static getScrollableWidthFromNodes(nodes, columnWidth, columnSpacing, innerMargin){
        return (_.reduce(nodes, function(highestCol, node){
            return Math.max(node.column, highestCol);
        }, 0) + 1) * (columnWidth + columnSpacing) + (innerMargin.left || 0) + (innerMargin.right || 0) - columnSpacing;
    }

    /**
     * Extends each node with X & Y coordinates.
     *
     * Converts column placement and position within columns,
     * along with other chart dimension settings, into X & Y coordinates.
     *
     * IMPORTANT:
     * Returns a new array but _modifies array items in place_.
     * If need fresh nodes, deep-clone before supplying `props.nodes`.
     *
     * @static
     * @memberof Graph
     */
    static getNodesWithCoordinates(
        nodes                = null,
        viewportWidth        = null,
        contentWidth         = null,
        contentHeight        = null,
        innerMargin          = { top: 0, right: 0, bottom: 0, left: 0 },
        rowSpacingType       = 'compact',
        rowSpacing           = 75,
        columnWidth          = 150,
        columnSpacing        = 56,
        isNodeCurrentContext = false
    ){
        /** Vertically centers a single node within a column */
        function centerNode(n){
            n.y = (contentHeight / 2) + innerMargin.top;
            n.nodesInColumn = 1;
            n.indexInColumn = 0;
        }

        var nodesByColumnPairs, leftOffset, nodesWithCoords;

        // Arrange into lists of columns
        // Ensure we're sorted, using column _numbers_ (JS objs keyed by str).
        nodesByColumnPairs = _.sortBy(_.map(
            _.pairs(_.groupBy(nodes, 'column')),
            function([ columnNumStr, nodesInColumn ]){
                return [ parseInt(columnNumStr), nodesInColumn ];
            }
        ), 0);

        // Set correct Y coordinate on each node depending on how many nodes are in each column.
        _.forEach(nodesByColumnPairs, ([ columnNumber, nodesInColumn ]) => {

            var countInCol = nodesInColumn.length;

            nodesInColumn = _.sortBy(nodesInColumn, 'indexInColumn');

            if (rowSpacingType === 'compact') {
                if (countInCol === 1) centerNode(nodesInColumn[0]);
                else {
                    var padding = Math.max(0, contentHeight - ((countInCol - 1) * rowSpacing)) / 2;
                    _.forEach(nodesInColumn, function(nodeInCol, idx){
                        nodeInCol.y = ((idx + 0) * rowSpacing) + innerMargin.top + padding;
                        nodeInCol.nodesInColumn = countInCol;
                    });
                }
            } else if (rowSpacingType === 'stacked') {
                _.forEach(nodesInColumn, function(nodeInCol, idx){
                    if (!nodeInCol) return;
                    nodeInCol.y = (rowSpacing * idx) + innerMargin.top;
                    nodeInCol.nodesInColumn = countInCol;
                });
            } else if (rowSpacingType === 'wide') {
                if (countInCol === 1) centerNode(nodesInColumn[0]);
                else {
                    _.forEach(
                        d3.range(0, contentHeight, contentHeight / (countInCol - 1)).concat([contentHeight]),
                        function(yCoordinate, idx){
                            var nodeInCol = nodesInColumn[idx];
                            if (!nodeInCol) return;
                            nodeInCol.y = yCoordinate + innerMargin.top;
                            nodeInCol.nodesInColumn = countInCol;
                        }
                    );
                }
            } else {
                console.error("Prop 'rowSpacingType' not valid. Must be ", Graph.propTypes.rowSpacingType);
                throw new Error("Prop 'rowSpacingType' not valid.");
            }
        });

        nodesWithCoords = _.reduce(nodesByColumnPairs, function(m, [ columnNumber, nodesInColumn ]){
            return m.concat(nodesInColumn);
        }, []);
        const columnCount = nodesByColumnPairs.length;

        leftOffset = innerMargin.left;

        // If there is extra viewport width, spread columns horizontally
        // to better use canvas before falling back to centered-cluster layout.
        let xColumnSpacing = columnSpacing;
        if (viewportWidth && columnCount > 1){
            const availableForColumns = Math.max(
                0,
                viewportWidth - innerMargin.left - innerMargin.right - (columnCount * columnWidth)
            );
            const baseGapTotal = (columnCount - 1) * columnSpacing;
            if (availableForColumns > baseGapTotal){
                xColumnSpacing = availableForColumns / (columnCount - 1);
                leftOffset = innerMargin.left;
            } else if (contentWidth && contentWidth < viewportWidth){
                leftOffset += (viewportWidth - contentWidth) / 2;
            }
        } else if (contentWidth && viewportWidth && contentWidth < viewportWidth){
            leftOffset += (viewportWidth - contentWidth) / 2;
        }

        // Set correct X coordinate on each node depending on column and spacing prop.
        _.forEach(nodesWithCoords, (node, i) => {
            node.x = node.column * (columnWidth + xColumnSpacing) + leftOffset;
        });

        // Finally, add boolean `isCurrentContext` flag to each node object if needed.
        if (typeof isNodeCurrentContext === 'function'){
            _.forEach(nodesWithCoords, function(node){
                node.isCurrentContext = isNodeCurrentContext(node);
            });
        }

        return nodesWithCoords;
    }

    constructor(props){
        super(props);
        this.height = this.height.bind(this);
        this.nodesWithCoordinates = this.nodesWithCoordinates.bind(this);
        this.setScale = this.setScale.bind(this);
        this.applyScaleBounds = this.applyScaleBounds.bind(this);
        this.state = {
            mounted: false,
            scale: props.scale,
            minScale: props.minScale,
            hasUserAdjustedScale: false
        };
        this.memoized = {
            getHeightFromNodes: memoize(Graph.getHeightFromNodes),
            getScrollableWidthFromNodes: memoize(Graph.getScrollableWidthFromNodes),
            getNodesWithCoordinates: memoize(Graph.getNodesWithCoordinates)
        };
    }

    componentDidMount(){
        this.setState({ 'mounted' : true }, () => {
            this.applyScaleBounds(true);
        });
    }

    componentDidUpdate(prevProps){
        if (
            prevProps.width !== this.props.width ||
            prevProps.nodes !== this.props.nodes ||
            prevProps.columnWidth !== this.props.columnWidth ||
            prevProps.columnSpacing !== this.props.columnSpacing ||
            prevProps.rowSpacing !== this.props.rowSpacing ||
            prevProps.innerMargin !== this.props.innerMargin
        ){
            this.applyScaleBounds(false);
        }
    }

    applyScaleBounds(isInitialMount = false){
        const {
            width,
            minimumHeight,
            minScale: propMinScale = 0.9,
            maxScale = 1.1,
            zoomToExtentsOnMount = true
        } = this.props;
        const { hasUserAdjustedScale } = this.state;
        if (typeof width !== 'number' || width <= 0) return;

        const graphWidth = this.scrollableWidth();
        const graphHeight = this.height() + ((this.props.innerMargin && this.props.innerMargin.top) || 0) + ((this.props.innerMargin && this.props.innerMargin.bottom) || 0);
        const viewportWidth = width;
        const viewportHeight = Math.max(minimumHeight || 0, graphHeight);

        const fitScaleWidth = viewportWidth / Math.max(graphWidth, 1);
        const fitScaleHeight = viewportHeight / Math.max(graphHeight, 1);
        const fitScale = Math.min(fitScaleWidth, fitScaleHeight);

        // Keep some breathing room for controls/scrollbars and avoid tiny zoom jumps.
        const boundedMin = Math.min(
            1,
            maxScale,
            Math.max(propMinScale, Math.floor(fitScale * 95) / 100)
        );

        this.setState((prevState) => {
            const nextState = { minScale: boundedMin };
            if (isInitialMount && zoomToExtentsOnMount && !hasUserAdjustedScale){
                nextState.scale = boundedMin;
            } else if (typeof prevState.scale === 'number' && prevState.scale < boundedMin){
                nextState.scale = boundedMin;
            }
            return nextState;
        });
    }

    setScale(scaleToSet, cb, options = {}){
        const { userInitiated = true } = options;
        this.setState(function(
            { minScale: stateMinScale, hasUserAdjustedScale: prevUserAdjusted },
            { minScale: propMinScale, maxScale }
        ){
            const scale = Math.max(
                Math.min(
                    maxScale,
                    scaleToSet
                ),
                stateMinScale || propMinScale
            );
            return { scale, hasUserAdjustedScale: userInitiated ? true : prevUserAdjusted };
        }, cb);
    }

    height() {
        const { nodes, nodesPreSortFxn, rowSpacing: propRowSpacing } = this.props;
        const { scale } = this.state;

        const rowSpacing = roundScaled(propRowSpacing, scale);
        return this.memoized.getHeightFromNodes(nodes, nodesPreSortFxn, rowSpacing);
    }

    scrollableWidth(){
        const { nodes, columnWidth: propColumnWidth, columnSpacing: propColumnSpacing, innerMargin } = this.props;
        const { scale } = this.state;

        const columnWidth = roundScaled(propColumnWidth, scale);
        const columnSpacing = roundScaled(propColumnSpacing, scale);
        return this.memoized.getScrollableWidthFromNodes(nodes, columnWidth, columnSpacing, innerMargin);
    }

    nodesWithCoordinates(viewportWidth, contentWidth, contentHeight){
        const { 
            nodes, innerMargin, 
            rowSpacingType, rowSpacing: propRowSpacing, columnWidth: propColumnWidth, columnSpacing: propColumnSpacing,
            isNodeCurrentContext
        } = this.props;
        const { scale } = this.state;
        
        const rowSpacing = roundScaled(propRowSpacing, scale);
        const columnWidth = roundScaled(propColumnWidth, scale);
        const columnSpacing = roundScaled(propColumnSpacing, scale);
        
        return this.memoized.getNodesWithCoordinates(
            nodes, viewportWidth, contentWidth, contentHeight, innerMargin,
            rowSpacingType, rowSpacing, columnWidth, columnSpacing,
            isNodeCurrentContext, scale || 1
        );
    }

    render(){
        const {
            width, innerMargin: propInnerMargin, edges, minimumHeight,
            columnSpacing: propColumnSpacing, rowSpacing: propRowSpacing, columnWidth: propColumnWidth, 
            scale: propScale = 1, maxScale: propMaxScale = 1.1, minScale: propMinScale = 0.9,
            showZoomControls, zoomControlsPortalSelector
        } = this.props;
        const { mounted, scale: stateScale } = this.state;
        const scale = stateScale || propScale;
        const innerHeight = this.height();
        const contentWidth = this.scrollableWidth();
        let innerWidth = width;

        const columnSpacing = roundScaled(propColumnSpacing, scale);
        const rowSpacing = roundScaled(propRowSpacing, scale);
        const columnWidth = roundScaled(propColumnWidth, scale);
        const innerMargin = {
            top: roundScaled(propInnerMargin.top, scale),
            right: roundScaled(propInnerMargin.right, scale),
            bottom: roundScaled(propInnerMargin.bottom, scale),
            left: roundScaled(propInnerMargin.left, scale),
        };

        if (!mounted) {
            return (
                <div key="outer">
                    <div>&nbsp;</div>
                </div>
            );
        }

        if (innerMargin && (innerMargin.left || innerMargin.right)){
            innerWidth -= (innerMargin.left || 0);
            innerWidth -= (innerMargin.right || 0);
        }

        const nodes = this.nodesWithCoordinates(innerWidth, contentWidth, innerHeight);
        const graphHeight = innerHeight + (innerMargin.top || 0) + (innerMargin.bottom || 0);

        /* TODO: later
        var spacerCount = _.reduce(nodes, function(m,n){ if (n.nodeType === 'spacer'){ return m + 1; } else { return m; }}, 0);
        if (spacerCount){
            height += (spacerCount * this.props.columnSpacing);
            graphHeight += (spacerCount * this.props.columnSpacing);
        }
        */
        let scaleControls = null;
        let portalScaleControls = null;
        if (showZoomControls && typeof this.setScale === "function") {
            const scaleProps = { scale, minScale: this.state.minScale || propMinScale, maxScale: propMaxScale, setScale: this.setScale };
            const scaleControlsElement = <ScaleControls {...scaleProps} className="portal-mounted" />;
            if (zoomControlsPortalSelector && typeof document !== 'undefined'){
                const portalTarget = document.querySelector(zoomControlsPortalSelector);
                if (portalTarget){
                    portalScaleControls = ReactDOM.createPortal(scaleControlsElement, portalTarget);
                } else {
                    scaleControls = scaleControlsElement;
                }
            } else {
                scaleControls = scaleControlsElement;
            }
        }
       
        return (
            <div className="workflow-chart-outer-container" key="outer">
                <div className="workflow-chart-inner-container">
                    {scaleControls}
                    <StateContainer {...{ nodes, edges, innerWidth, innerHeight, contentWidth, width }}
                        {..._.pick(this.props, 'pathArrows', 'href', 'onNodeClick', 'renderDetailPane')}>
                        <ScrollContainer outerHeight={graphHeight} minHeight={minimumHeight}>
                            <EdgesLayer {...{ scale, columnWidth: propColumnWidth, columnSpacing: propColumnSpacing, rowSpacing: propRowSpacing, innerMargin: propInnerMargin }}
                                {..._.pick(this.props, 'isNodeDisabled', 'isNodeCurrentContext', 'isNodeSelected', 'edgeStyle', 'nodeEdgeLedgeWidths')} />
                            <NodesLayer {...{ scale, columnWidth: propColumnWidth, columnSpacing: propColumnSpacing, innerMargin: propInnerMargin }}
                                {..._.pick(this.props, 'renderNodeElement', 'isNodeDisabled', 'isNodeCurrentContext', 'nodeClassName')} />
                        </ScrollContainer>
                    </StateContainer>
                </div>
                { portalScaleControls }
            </div>
        );
    }

}

/**
 * Optional component to wrap Graph and pass steps in.
 * @todo Test for (lack of) bidirectionality in data and fix.
 */
export class GraphParser extends React.Component {

    static defaultProps = {
        'parsingOptions' : {
            showReferenceFiles: true,
            showParameters: true,
            showIndirectFiles: true,
            parseBasicIO: false
        },
        'parentItem' : { name: "Workflow" }
    };

    constructor(props){
        super(props);
        this.memoized = {
            parseAnalysisSteps : memoize(parseAnalysisSteps),
            parseBasicIOAnalysisSteps : memoize(parseBasicIOAnalysisSteps)
        };
    }

    render(){
        const {
            steps,
            parentItem,
            children,
            parsingOptions
        } = this.props;
    
        const { parseBasicIO } = parsingOptions;

        let graphData;

        if (parseBasicIO) {
            graphData = this.memoized.parseBasicIOAnalysisSteps(steps, parentItem, parsingOptions);
        } else {
            graphData = this.memoized.parseAnalysisSteps(steps, parsingOptions);
        }

        return React.Children.map(children, function(child){
            return React.cloneElement(child, graphData);
        });
    }
}
