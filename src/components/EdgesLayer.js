'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import _ from 'underscore';
import { TransitionGroup, Transition } from 'react-transition-group';
import { path as d3Path } from 'd3';

import Edge from './Edge';





export function traceEdges(
    originalEdges,
    nodes,
    columnWidth, columnSpacing, rowSpacing, contentWidth, contentHeight, innerMargin, nodeEdgeLedgeWidths = [10, 10]
){
    const topMargin = (innerMargin && innerMargin.top) || 0;
    const leftMargin = (innerMargin && innerMargin.left) || 0;
    const endHeight = topMargin + contentHeight + (innerMargin && Math.max(0, innerMargin.bottom - 10)) || 0;
    const colStartXMap = {}; // Filled in visibility graph

    const nodesByColumn = _.reduce(nodes, function(m, node){
        const { column } = node;
        if (typeof m[column] === 'undefined'){
            m[column] = []; // Keys assigned as str, not numbers
        }
        m[column].push(node);
        return m;
    }, {});
    const columnCount = _.keys(nodesByColumn).length;

    function buildVisibilityGraph(subdivisions = 4){
        // Horizontal Line Y Coords
        const partialHeight = rowSpacing / subdivisions;
        const quarterHeight = rowSpacing / 4;
        const horizontalLineYCoords = [];
        let currY = topMargin;
        while (currY >= 10){
            currY -= partialHeight;
        }
        while (currY < endHeight){
            currY += partialHeight;
            horizontalLineYCoords.push(currY);
        }

        const segments = [];
        const segmentsByColumnIdx = [];

        for (let columnIdx = 0; columnIdx < columnCount; columnIdx++){
            segmentsByColumnIdx.push([]);
            const nodesInColYCoords = _.pluck(nodesByColumn[columnIdx], 'y');
            const nodesInColYCoordsLen = nodesInColYCoords.length;
            let colStartX = colStartXMap[columnIdx];
            if (typeof colStartX === 'undefined'){
                colStartX = colStartXMap[columnIdx] = leftMargin + (columnIdx * columnWidth) + (columnSpacing * columnIdx);
            }
            const colEndX = colStartX + columnWidth;
            _.forEach(horizontalLineYCoords, function(yCoord){
                for (let i = 0; i < nodesInColYCoordsLen; i++){
                    const highY = nodesInColYCoords[i] + quarterHeight;
                    const lowY = nodesInColYCoords[i] - quarterHeight;
                    if (yCoord <= highY && yCoord >= lowY){
                        return;
                    }
                }
                const segment = [[colStartX, yCoord], [colEndX, yCoord]];
                segments.push(segment);
                segmentsByColumnIdx[columnIdx].push(segment);
            });
        }

        // console.log('HORZ', horizontalLineYCoords, endHeight, nodesByColumn, segments);
        return { segments, segmentsByColumnIdx };
    }

    function assembleSegments(segmentQ, subdivisionsUsed = 4){

        const usedSegments = new Map(); // (segment, [[source, target], ...])
        const segmentQLen = segmentQ.length;

        /**
         * 
         * @param {number} columnIdx - Higher-level abstraction of 'prevXCoord'. Previous/curr column to get segment from.
         * @param {number} prevYCoord - Previous Y
         * @param {Object} source - Source Node
         * @param {Object} target - Target Node
         * @param {*} previousEdges 
         */
        function getNearestSegment(columnIdx, prevYCoord, source, target, previousEdges = []){
            const { y: targetYCoord } = target;
            const startXForCol = colStartXMap[columnIdx];
            const prevEdgesLen = previousEdges.length;

            const upperY = Math.max(prevYCoord, targetYCoord);
            const lowerY = Math.min(prevYCoord, targetYCoord);
            //const yCoordMedian = (prevYCoord + targetYCoord) / 2;

            let closestSegmentDiff = Infinity;
            let closestSegmentIdx = -1;
            let currSegment = null, currSegmentY = 0, currExistingSegmentNodes = null, currDiff = null;
            let i, j, prevEdge, prevVs, multiplier = 1, intersections = 0, willDiverge = false;
            for (i = 0; i < segmentQLen; i++){
                currSegment = segmentQ[i];
                currSegmentY = currSegment[0][1];

                if (currSegment[0][0] !== startXForCol){
                    continue;
                }

                // Skip used segments unless (going to same target node) or (from same source node and on same Y coord).
                currExistingSegmentNodes = usedSegments.get(currSegment);
                if (currExistingSegmentNodes){
                    willDiverge = _.every(currExistingSegmentNodes, function([ exSrc, exTgt ]){ return exSrc === source; });
                    // if (!(
                    //     willDiverge || // (below) Gets a little confusing if converge esp in order/grouping. `currSegmentY === prevYCoord` addresses this somewhat.
                    //     (_.every(currExistingSegmentNodes, function([ exSrc, exTgt ]){ return exTgt === target; }) && currSegmentY === prevYCoord)
                    // )) {
                    //     continue;
                    // }
                    if (!willDiverge) {
                        continue;
                    }
                }

                //currDiff = Math.abs(yCoordMedian - currSegmentY);
                if (currSegmentY > upperY){
                    currDiff = currSegmentY - upperY;
                } else if (currSegmentY < lowerY){
                    currDiff = lowerY - currSegmentY;
                } else if (willDiverge) {
                    currDiff = -0.01;
                } else {
                //{
                    // Any path between lower and upper bound is fine.
                    // Favor those closer to prev edge
                    //currDiff = Math.abs(targetYCoord - currSegmentY) * 0.01;
                    currDiff = Math.abs(prevYCoord - currSegmentY) * 0.01;
                }

                // Check for intersections, add to score (unless reusing existing segment)
                if (!currExistingSegmentNodes) {
                    intersections = 0;
                    for (j = 0; j < prevEdgesLen; j++){
                        prevEdge = previousEdges[j];
                        if (Array.isArray(prevEdge.vertices)){
                            prevVs = prevEdge.vertices;
                            multiplier = 2;
                        } else {
                            prevVs = [
                                [ prevEdge.source.x + columnWidth, prevEdge.source.y ],
                                [ prevEdge.target.x, prevEdge.target.y ]
                            ];
                            multiplier = 1;
                        }

                        prevVs.reduce(function(prevV, v){
                            if (!prevV) return v; // First V

                            if (!(prevV[0] + nodeEdgeLedgeWidths[0] < startXForCol && v[0] >= startXForCol - nodeEdgeLedgeWidths[0])){
                                return v;
                            }
                            // if (source.name === "chromsize" && columnIdx === 2) {
                            //     console.log('TTTX\n', v, '\n', prevV, '\n', columnIdx, intersections);
                            // }
                            if (
                                (v[1] > currSegmentY && prevV[1] < prevYCoord) ||
                                (v[1] < currSegmentY && prevV[1] > prevYCoord)
                            ) {
                                // Boost 'any' intersections
                                // Multiplier allows us to try to avoid intersecting
                                // bigger lines moreso than smaller ones
                                if (intersections === 0) intersections += 2 * multiplier;
                                intersections += multiplier;
                                //if (startXForCol> 1400 && startXForCol < 1600){
                                //    console.log('X', v[0], v[1], '<-', prevV[0], prevV[1]);
                                //}
                            }
                            return v;
                        }, null);

                    }

                    // if (source.name === "chromsize" && columnIdx === 2) {
                    //     console.log('TTT', previousEdges.slice(), columnIdx, currSegmentY, intersections);
                    // }

                    currDiff += (intersections * (rowSpacing * 0.8));

                } // end intersection checking

                //if (startXForCol> 1400 && startXForCol < 1600){
                //    console.log('INT', currDiff, currSegmentY, intersections, prevYCoord);
                //}

                if (closestSegmentDiff > currDiff){
                    closestSegmentDiff = currDiff;
                    closestSegmentIdx = i;
                }

                // console.log("SEG", currSegment, intersections, prevYCoord, currDiff);

            }
            if (closestSegmentIdx === -1){
                return null;
            }

            const bestSegment = segmentQ[closestSegmentIdx];
            if (currExistingSegmentNodes) {
                currExistingSegmentNodes.push([ source, target ]);
            } else {
                usedSegments.set(bestSegment, [[ source, target ]]);
            }
            return bestSegment;
        }

        const originalEdgesSortedByLength = originalEdges.slice(0).sort(function(edgeA, edgeB){
            const { source: sA, target: tA } = edgeA;
            const { source: sB, target: tB } = edgeB;
            const colDifA = Math.abs(tA.column - sA.column);
            const colDifB = Math.abs(tB.column - sB.column);

            // If just 1 col dif, move to front for intersection testing (tracing skipped)
            if (colDifA === 1 && colDifB === 1){
                return 0;
            }
            if (colDifA === 1) {
                return -1;
            }
            if (colDifB === 1) {
                return 1;
            }

            // Else do longer edges first
            const xDistA = Math.abs(tA.x - sA.x);
            const xDistB = Math.abs(tB.x - sB.x);

            if (xDistA > xDistB) return -1;
            if (xDistA < xDistB) return 1;

            const yDistA = Math.abs(tA.y - sA.y);
            const yDistB = Math.abs(tB.y - sB.y);

            if (yDistA > yDistB) return 1;
            if (yDistA < yDistB) return -1;

            return 0;
        });

        const resultEdges = [];
        originalEdgesSortedByLength.forEach(function(edge){
            const { source, target } = edge;
            const { column: sourceCol, x: sourceX, y: sourceY } = source;
            const { column: targetCol, x: targetX, y: targetY } = target;
            const columnDiff = targetCol - sourceCol;

            if (columnDiff <= 0){
                // Shouldn't happen I don't think except if file is re-used/generated or some other unexpected condition.
                console.error("Target column is greater than source column", source, target);
                resultEdges.push(edge);
                return; // Skip tracing it.
            }

            if (columnDiff === 1){
                resultEdges.push(edge);
                return; // Doesn't need to go around obstacles, skip.
            }

            const vertices = [[ sourceX + columnWidth, sourceY ]];

            let prevY = sourceY;
            for (let colIdx = sourceCol + 1; colIdx < targetCol; colIdx++){
                //const yDiff = targetY - prevY;
                //const idealYCoord = prevY + (yDiff / 2); // (((colIdx - sourceCol) / columnDiff) * yDiff);
                const bestSegment = getNearestSegment(
                    colIdx,
                    prevY,
                    source,
                    target,
                    resultEdges
                );
                if (!bestSegment){
                    throw new Error("Could not find viable path for edge");
                }
                const [ [ bsX, bsY ], [ beX, beY ] ] = bestSegment;
                //const origSrcTrg = usedSegments.get(bestSegment);
                //const isReusedSource = origSrcTrg[0] === source && origSrcTrg[1] !== target;
                vertices.push([ bsX - nodeEdgeLedgeWidths[0], bsY ]);
                vertices.push([ beX + nodeEdgeLedgeWidths[1], beY ]);
                prevY = beY;
            }
            vertices.push([ targetX, targetY ]);

            // console.log("EDGE", edge);

            resultEdges.push({ ...edge, vertices })
        });

        return resultEdges;
    }

    let res;
    let tracedEdges = null;
    let attempts = 0;

    while (!tracedEdges && attempts < 5){
        res = buildVisibilityGraph(4 + attempts);
        try {
            tracedEdges = assembleSegments(res.segments, 4 + attempts);
        } catch (e){
            tracedEdges = null;
            if (e.message === "Could not find viable path for edge"){
                console.warn("Could not find path", attempts);
            } else {
                throw e;
            }
        }
        attempts++;
    }

    return {
        edges: tracedEdges,
        horizontalSegments: res.segments
    };
}

const ForwardedEdge = React.forwardRef((props, ref) => {
    return <Edge {...props} forwardedRef={ref} />;
});

export default class EdgesLayer extends React.PureComponent {

    /**
     * Move selected edges to top, and disabled ones to bottom, because CSS z-index doesn't work for SVG elements.
     */
    static sortedEdges(edges, selectedNode, isNodeDisabled){
        return edges.slice(0).sort((a,b)=>{
            var isASelected = Edge.isSelected(a, selectedNode, isNodeDisabled);
            var isBSelected = Edge.isSelected(b, selectedNode, isNodeDisabled);

            if (isASelected && !isBSelected){
                return 1;
            } else if (!isASelected && isBSelected){
                return -1;
            } else {
                return 0;
            }
        }).sort((a,b)=>{
            var isADisabled = Edge.isDisabled(a, isNodeDisabled);
            var isBDisabled = Edge.isDisabled(b, isNodeDisabled);

            if (isADisabled && !isBDisabled){
                return -1;
            } else if (!isADisabled && isBDisabled) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    constructor(props){
        super(props);
        this.sortedEdges = this.sortedEdges.bind(this);
        // Create refs for each node
        this.nodeRefs = {};
    }

    static edgeOnEnter(nodeRef) {
        if (nodeRef.current && nodeRef.current.style) {
            nodeRef.current.style.opacity = 0;
        }
    }

    static edgeOnEntering(nodeRef) {
        if (nodeRef.current && nodeRef.current.style) {
            nodeRef.current.style.opacity = 0;
        }
    }

    static edgeOnEntered(nodeRef) {
        if (nodeRef.current && nodeRef.current.style) {
            nodeRef.current.style.opacity = null;
        }
    }

    static edgeOnExit(nodeRef) {
        if (nodeRef.current && nodeRef.current.style) {
            nodeRef.current.style.opacity = 0;
        }
    }

    sortedEdges = memoize(function(edges, selectedNodes, isNodeDisabled){
        const nextEdges = EdgesLayer.sortedEdges(edges, selectedNodes, isNodeDisabled);;
        return nextEdges;
    });

    pathArrows(){
        if (!this.props.pathArrows) return null;
        return Edge.pathArrowsMarkers();
    }

    /**
     * Wraps Edges and each Edge in TransitionGroup and Transition, respectively.
     * We cannot use CSSTransition at the moment because it does not change the className
     * of SVG element(s). We must manually change it (or an attribute of it).
     */
    render(){
        const {
            outerHeight, innerWidth, innerMargin, width, edges: origEdges, nodes,
            selectedNode, isNodeDisabled, contentWidth,
            columnWidth, columnSpacing, rowSpacing, innerHeight
        } = this.props;
        const {
            edges,
            horizontalSegments
        } = traceEdges(origEdges, nodes, columnWidth, columnSpacing, rowSpacing, contentWidth, innerHeight, innerMargin);
        const edgeCount = edges.length;
        const divWidth = Math.max(width, contentWidth);

        return (
            <div className="edges-layer-wrapper" style={{ 'width' : divWidth, 'height' : outerHeight }}>
                <svg className="edges-layer" width={divWidth} height={outerHeight}>
                    { this.pathArrows() }
                    <TransitionGroup component={null}>
                        {
                            _.map(this.sortedEdges(edges, selectedNode, isNodeDisabled), (edge, index) => {
                                const key = (edge.source.id || edge.source.name) + "----" + (edge.target.id || edge.target.name);
                                if (!this.nodeRefs[key]) {
                                    this.nodeRefs[key] = React.createRef();
                                }
                                return (
                                    <Transition
                                        unmountOnExit
                                        mountOnEnter
                                        timeout={500}
                                        key={key}
                                        onEnter={() => EdgesLayer.edgeOnEnter(this.nodeRefs[key])}
                                        onEntering={() => EdgesLayer.edgeOnEntering(this.nodeRefs[key])}
                                        onEntered={() => EdgesLayer.edgeOnEntered(this.nodeRefs[key])}
                                        onExit={() => EdgesLayer.edgeOnExit(this.nodeRefs[key])}
                                        nodeRef={this.nodeRefs[key]}>
                                        <ForwardedEdge
                                            {...this.props}
                                            {...{ key, edge, edgeCount }}
                                            startX={edge.source.x}
                                            startY={edge.source.y}
                                            endX={edge.target.x}
                                            endY={edge.target.y}
                                            ref={this.nodeRefs[key]} />
                                    </Transition>
                                );
                            })
                        }
                    </TransitionGroup>
                    <DebugVizGraphLayer segments={horizontalSegments} />
                </svg>
            </div>
        );
    }

}

const DebugVizGraphLayer = React.memo(function DebugVizGraphLayer({ segments, enabled = false }){
    if (!enabled) return null;
    const paths = segments.map(function(seg){
        const path = d3Path();
        path.moveTo(...seg[0]);
        path.lineTo(...seg[1]);
        return path.toString();
    }).map(function(pathStr, idx){
        return <path d={pathStr} key={idx}/>;
    });
    return (
        <g className="vis-debug-graph">
            { paths }
        </g>
    );
});
