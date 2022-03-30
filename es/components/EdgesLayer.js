'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.traceEdges = traceEdges;
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var _underscore = _interopRequireDefault(require("underscore"));

var _reactTransitionGroup = require("react-transition-group");

var _d2 = require("d3");

var _Edge = _interopRequireDefault(require("./Edge"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function (o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function (o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function traceEdges(originalEdges, nodes, columnWidth, columnSpacing, rowSpacing, contentWidth, contentHeight, innerMargin) {
  var nodeEdgeLedgeWidths = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : [10, 10];
  var topMargin = innerMargin && innerMargin.top || 0;
  var leftMargin = innerMargin && innerMargin.left || 0;
  var endHeight = topMargin + contentHeight + (innerMargin && Math.max(0, innerMargin.bottom - 10)) || 0;
  var colStartXMap = {}; // Filled in visibility graph

  var nodesByColumn = _underscore["default"].reduce(nodes, function (m, node) {
    var column = node.column;

    if (typeof m[column] === 'undefined') {
      m[column] = []; // Keys assigned as str, not numbers
    }

    m[column].push(node);
    return m;
  }, {});

  var columnCount = _underscore["default"].keys(nodesByColumn).length;

  function buildVisibilityGraph() {
    var subdivisions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
    // Horizontal Line Y Coords
    var partialHeight = rowSpacing / subdivisions;
    var quarterHeight = rowSpacing / 4;
    var horizontalLineYCoords = [];
    var currY = topMargin;

    while (currY >= 10) {
      currY -= partialHeight;
    }

    while (currY < endHeight) {
      currY += partialHeight;
      horizontalLineYCoords.push(currY);
    }

    var segments = [];
    var segmentsByColumnIdx = [];

    var _loop = function (columnIdx) {
      segmentsByColumnIdx.push([]);

      var nodesInColYCoords = _underscore["default"].pluck(nodesByColumn[columnIdx], 'y');

      var nodesInColYCoordsLen = nodesInColYCoords.length;
      var colStartX = colStartXMap[columnIdx];

      if (typeof colStartX === 'undefined') {
        colStartX = colStartXMap[columnIdx] = leftMargin + columnIdx * columnWidth + columnSpacing * columnIdx;
      }

      var colEndX = colStartX + columnWidth;

      _underscore["default"].forEach(horizontalLineYCoords, function (yCoord) {
        for (var i = 0; i < nodesInColYCoordsLen; i++) {
          var highY = nodesInColYCoords[i] + quarterHeight;
          var lowY = nodesInColYCoords[i] - quarterHeight;

          if (yCoord <= highY && yCoord >= lowY) {
            return;
          }
        }

        var segment = [[colStartX, yCoord], [colEndX, yCoord]];
        segments.push(segment);
        segmentsByColumnIdx[columnIdx].push(segment);
      });
    };

    for (var columnIdx = 0; columnIdx < columnCount; columnIdx++) {
      _loop(columnIdx);
    } // console.log('HORZ', horizontalLineYCoords, endHeight, nodesByColumn, segments);


    return {
      segments: segments,
      segmentsByColumnIdx: segmentsByColumnIdx
    };
  }

  function assembleSegments(segmentQ) {
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
    var usedSegments = new Map(); // (segment, [[source, target], ...])

    var segmentQLen = segmentQ.length;
    /**
     * 
     * @param {number} columnIdx - Higher-level abstraction of 'prevXCoord'. Previous/curr column to get segment from.
     * @param {number} prevYCoord - Previous Y
     * @param {Object} source - Source Node
     * @param {Object} target - Target Node
     * @param {*} previousEdges 
     */

    function getNearestSegment(columnIdx, prevYCoord, source, target) {
      var previousEdges = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
      var targetYCoord = target.y;
      var startXForCol = colStartXMap[columnIdx];
      var prevEdgesLen = previousEdges.length;
      var upperY = Math.max(prevYCoord, targetYCoord);
      var lowerY = Math.min(prevYCoord, targetYCoord); //const yCoordMedian = (prevYCoord + targetYCoord) / 2;

      var closestSegmentDiff = Infinity;
      var closestSegmentIdx = -1;
      var currSegment = null,
          currSegmentY = 0,
          currExistingSegmentNodes = null,
          currDiff = null;
      var i,
          j,
          prevEdge,
          prevVs,
          multiplier = 1,
          intersections = 0,
          willDiverge = false;

      for (i = 0; i < segmentQLen; i++) {
        currSegment = segmentQ[i];
        currSegmentY = currSegment[0][1];

        if (currSegment[0][0] !== startXForCol) {
          continue;
        } // Skip used segments unless (going to same target node) or (from same source node and on same Y coord).


        currExistingSegmentNodes = usedSegments.get(currSegment);

        if (currExistingSegmentNodes) {
          willDiverge = _underscore["default"].every(currExistingSegmentNodes, function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                exSrc = _ref2[0],
                exTgt = _ref2[1];

            return exSrc === source;
          }); // if (!(
          //     willDiverge || // (below) Gets a little confusing if converge esp in order/grouping. `currSegmentY === prevYCoord` addresses this somewhat.
          //     (_.every(currExistingSegmentNodes, function([ exSrc, exTgt ]){ return exTgt === target; }) && currSegmentY === prevYCoord)
          // )) {
          //     continue;
          // }

          if (!willDiverge) {
            continue;
          }
        } //currDiff = Math.abs(yCoordMedian - currSegmentY);


        if (currSegmentY > upperY) {
          currDiff = currSegmentY - upperY;
        } else if (currSegmentY < lowerY) {
          currDiff = lowerY - currSegmentY;
        } else if (willDiverge) {
          currDiff = -0.01;
        } else {
          //{
          // Any path between lower and upper bound is fine.
          // Favor those closer to prev edge
          //currDiff = Math.abs(targetYCoord - currSegmentY) * 0.01;
          currDiff = Math.abs(prevYCoord - currSegmentY) * 0.01;
        } // Check for intersections, add to score (unless reusing existing segment)


        if (!currExistingSegmentNodes) {
          intersections = 0;

          for (j = 0; j < prevEdgesLen; j++) {
            prevEdge = previousEdges[j];

            if (Array.isArray(prevEdge.vertices)) {
              prevVs = prevEdge.vertices;
              multiplier = 2;
            } else {
              prevVs = [[prevEdge.source.x + columnWidth, prevEdge.source.y], [prevEdge.target.x, prevEdge.target.y]];
              multiplier = 1;
            }

            prevVs.reduce(function (prevV, v) {
              if (!prevV) return v; // First V

              if (!(prevV[0] + nodeEdgeLedgeWidths[0] < startXForCol && v[0] >= startXForCol - nodeEdgeLedgeWidths[0])) {
                return v;
              } // if (source.name === "chromsize" && columnIdx === 2) {
              //     console.log('TTTX\n', v, '\n', prevV, '\n', columnIdx, intersections);
              // }


              if (v[1] > currSegmentY && prevV[1] < prevYCoord || v[1] < currSegmentY && prevV[1] > prevYCoord) {
                // Boost 'any' intersections
                // Multiplier allows us to try to avoid intersecting
                // bigger lines moreso than smaller ones
                if (intersections === 0) intersections += 2 * multiplier;
                intersections += multiplier; //if (startXForCol> 1400 && startXForCol < 1600){
                //    console.log('X', v[0], v[1], '<-', prevV[0], prevV[1]);
                //}
              }

              return v;
            }, null);
          } // if (source.name === "chromsize" && columnIdx === 2) {
          //     console.log('TTT', previousEdges.slice(), columnIdx, currSegmentY, intersections);
          // }


          currDiff += intersections * (rowSpacing * 0.8);
        } // end intersection checking
        //if (startXForCol> 1400 && startXForCol < 1600){
        //    console.log('INT', currDiff, currSegmentY, intersections, prevYCoord);
        //}


        if (closestSegmentDiff > currDiff) {
          closestSegmentDiff = currDiff;
          closestSegmentIdx = i;
        } // console.log("SEG", currSegment, intersections, prevYCoord, currDiff);

      }

      if (closestSegmentIdx === -1) {
        return null;
      }

      var bestSegment = segmentQ[closestSegmentIdx];

      if (currExistingSegmentNodes) {
        currExistingSegmentNodes.push([source, target]);
      } else {
        usedSegments.set(bestSegment, [[source, target]]);
      }

      return bestSegment;
    }

    var originalEdgesSortedByLength = originalEdges.slice(0).sort(function (edgeA, edgeB) {
      var sA = edgeA.source,
          tA = edgeA.target;
      var sB = edgeB.source,
          tB = edgeB.target;
      var colDifA = Math.abs(tA.column - sA.column);
      var colDifB = Math.abs(tB.column - sB.column); // If just 1 col dif, move to front for intersection testing (tracing skipped)

      if (colDifA === 1 && colDifB === 1) {
        return 0;
      }

      if (colDifA === 1) {
        return -1;
      }

      if (colDifB === 1) {
        return 1;
      } // Else do longer edges first


      var xDistA = Math.abs(tA.x - sA.x);
      var xDistB = Math.abs(tB.x - sB.x);
      if (xDistA > xDistB) return -1;
      if (xDistA < xDistB) return 1;
      var yDistA = Math.abs(tA.y - sA.y);
      var yDistB = Math.abs(tB.y - sB.y);
      if (yDistA > yDistB) return 1;
      if (yDistA < yDistB) return -1;
      return 0;
    });
    var resultEdges = [];
    originalEdgesSortedByLength.forEach(function (edge) {
      var source = edge.source,
          target = edge.target;
      var sourceCol = source.column,
          sourceX = source.x,
          sourceY = source.y;
      var targetCol = target.column,
          targetX = target.x,
          targetY = target.y;
      var columnDiff = targetCol - sourceCol;

      if (columnDiff <= 0) {
        // Shouldn't happen I don't think except if file is re-used/generated or some other unexpected condition.
        console.error("Target column is greater than source column", source, target);
        resultEdges.push(edge);
        return; // Skip tracing it.
      }

      if (columnDiff === 1) {
        resultEdges.push(edge);
        return; // Doesn't need to go around obstacles, skip.
      }

      var vertices = [[sourceX + columnWidth, sourceY]];
      var prevY = sourceY;

      for (var colIdx = sourceCol + 1; colIdx < targetCol; colIdx++) {
        //const yDiff = targetY - prevY;
        //const idealYCoord = prevY + (yDiff / 2); // (((colIdx - sourceCol) / columnDiff) * yDiff);
        var bestSegment = getNearestSegment(colIdx, prevY, source, target, resultEdges);

        if (!bestSegment) {
          throw new Error("Could not find viable path for edge");
        }

        var _bestSegment = _slicedToArray(bestSegment, 2),
            _bestSegment$ = _slicedToArray(_bestSegment[0], 2),
            bsX = _bestSegment$[0],
            bsY = _bestSegment$[1],
            _bestSegment$2 = _slicedToArray(_bestSegment[1], 2),
            beX = _bestSegment$2[0],
            beY = _bestSegment$2[1]; //const origSrcTrg = usedSegments.get(bestSegment);
        //const isReusedSource = origSrcTrg[0] === source && origSrcTrg[1] !== target;


        vertices.push([bsX - nodeEdgeLedgeWidths[0], bsY]);
        vertices.push([beX + nodeEdgeLedgeWidths[1], beY]);
        prevY = beY;
      }

      vertices.push([targetX, targetY]); // console.log("EDGE", edge);

      resultEdges.push(_objectSpread({}, edge, {
        vertices: vertices
      }));
    });
    return resultEdges;
  }

  var res;
  var tracedEdges = null;
  var attempts = 0;

  while (!tracedEdges && attempts < 5) {
    res = buildVisibilityGraph(4 + attempts);

    try {
      tracedEdges = assembleSegments(res.segments, 4 + attempts);
    } catch (e) {
      tracedEdges = null;

      if (e.message === "Could not find viable path for edge") {
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

var EdgesLayer =
/*#__PURE__*/
function (_React$PureComponent) {
  _inherits(EdgesLayer, _React$PureComponent);

  _createClass(EdgesLayer, null, [{
    key: "sortedEdges",

    /**
     * Move selected edges to top, and disabled ones to bottom, because CSS z-index doesn't work for SVG elements.
     */
    value: function sortedEdges(edges, selectedNode, isNodeDisabled) {
      return edges.slice(0).sort(function (a, b) {
        var isASelected = _Edge["default"].isSelected(a, selectedNode, isNodeDisabled);

        var isBSelected = _Edge["default"].isSelected(b, selectedNode, isNodeDisabled);

        if (isASelected && !isBSelected) {
          return 1;
        } else if (!isASelected && isBSelected) {
          return -1;
        } else {
          return 0;
        }
      }).sort(function (a, b) {
        var isADisabled = _Edge["default"].isDisabled(a, isNodeDisabled);

        var isBDisabled = _Edge["default"].isDisabled(b, isNodeDisabled);

        if (isADisabled && !isBDisabled) {
          return -1;
        } else if (!isADisabled && isBDisabled) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }]);

  function EdgesLayer(props) {
    var _this;

    _classCallCheck(this, EdgesLayer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EdgesLayer).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "sortedEdges", (0, _memoizeOne["default"])(function (edges, selectedNodes, isNodeDisabled) {
      var nextEdges = EdgesLayer.sortedEdges(edges, selectedNodes, isNodeDisabled); // Create new list of refs each time we're updated.
      //this.edgeRefs = [];
      //_.forEach(nextEdges, ()=>{
      //    this.edgeRefs.push(React.createRef());
      //});

      return nextEdges;
    }));

    _this.sortedEdges = _this.sortedEdges.bind(_assertThisInitialized(_this)); //this.getAllPathElements = this.getAllPathElements.bind(this);
    //this.edgeRefs = [];

    return _this;
  }

  _createClass(EdgesLayer, [{
    key: "pathArrows",
    // Experimentation with transitioning multiple edges at once within requestAnimationFrame.
    // Need to rethink design of this, an array for this.edgeRefs won't work as we need to keep
    // state.source.x, state.source.y cached in state and associated w/ each edge.
    // Possibly can use object keyed by 'key' string (as determined in render method).
    // Keeping for reference.
    //
    //getAllPathElements(){
    //    return _.map(this.edgeRefs, function(ref){
    //        return ref && ref.current && ref.current.pathRef && ref.current.pathRef.current;
    //    });
    //}
    value: function pathArrows() {
      if (!this.props.pathArrows) return null;
      return _Edge["default"].pathArrowsMarkers();
    }
    /**
     * Wraps Edges and each Edge in TransitionGroup and Transition, respectively.
     * We cannot use CSSTransition at the moment because it does not change the className
     * of SVG element(s). We must manually change it (or an attribute of it).
     */

  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          outerHeight = _this$props.outerHeight,
          innerWidth = _this$props.innerWidth,
          innerMargin = _this$props.innerMargin,
          width = _this$props.width,
          origEdges = _this$props.edges,
          nodes = _this$props.nodes,
          selectedNode = _this$props.selectedNode,
          isNodeDisabled = _this$props.isNodeDisabled,
          contentWidth = _this$props.contentWidth,
          columnWidth = _this$props.columnWidth,
          columnSpacing = _this$props.columnSpacing,
          rowSpacing = _this$props.rowSpacing,
          innerHeight = _this$props.innerHeight;

      var _traceEdges = traceEdges(origEdges, nodes, columnWidth, columnSpacing, rowSpacing, contentWidth, innerHeight, innerMargin),
          edges = _traceEdges.edges,
          horizontalSegments = _traceEdges.horizontalSegments;

      var edgeCount = edges.length;
      var divWidth = Math.max(width, contentWidth);
      return _react["default"].createElement("div", {
        className: "edges-layer-wrapper",
        style: {
          'width': divWidth,
          'height': outerHeight
        }
      }, _react["default"].createElement("svg", {
        className: "edges-layer",
        width: divWidth,
        height: outerHeight
      }, this.pathArrows(), _react["default"].createElement(_reactTransitionGroup.TransitionGroup, {
        component: null
      }, _underscore["default"].map(this.sortedEdges(edges, selectedNode, isNodeDisabled), function (edge) {
        var key = (edge.source.id || edge.source.name) + "----" + (edge.target.id || edge.target.name);
        return _react["default"].createElement(_reactTransitionGroup.Transition, {
          unmountOnExit: true,
          mountOnEnter: true,
          timeout: 500,
          key: key,
          onEnter: EdgesLayer.edgeOnEnter,
          onEntering: EdgesLayer.edgeOnEntering,
          onExit: EdgesLayer.edgeOnExit,
          onEntered: EdgesLayer.edgeOnEntered
        }, _react["default"].createElement(_Edge["default"], _extends({}, _this2.props, {
          key: key,
          edge: edge,
          edgeCount: edgeCount
        }, {
          startX: edge.source.x,
          startY: edge.source.y,
          endX: edge.target.x,
          endY: edge.target.y
        })));
      })), _react["default"].createElement(DebugVizGraphLayer, {
        segments: horizontalSegments
      })));
    }
  }], [{
    key: "edgeOnEnter",
    value: function edgeOnEnter(elem) {
      elem.style.opacity = 0;
    }
  }, {
    key: "edgeOnEntering",
    value: function edgeOnEntering(elem) {
      elem.style.opacity = 0;
    }
  }, {
    key: "edgeOnEntered",
    value: function edgeOnEntered(elem) {
      elem.style.opacity = null;
      /** Allows CSS to override, e.g. .15 opacity for disabled edges */
    }
  }, {
    key: "edgeOnExit",
    value: function edgeOnExit(elem) {
      elem.style.opacity = 0;
    }
  }]);

  return EdgesLayer;
}(_react["default"].PureComponent);

exports["default"] = EdgesLayer;

var DebugVizGraphLayer = _react["default"].memo(function (_ref3) {
  var segments = _ref3.segments,
      _ref3$enabled = _ref3.enabled,
      enabled = _ref3$enabled === void 0 ? false : _ref3$enabled;
  if (!enabled) return null;
  var paths = segments.map(function (seg) {
    var path = (0, _d2.path)();
    path.moveTo.apply(path, _toConsumableArray(seg[0]));
    path.lineTo.apply(path, _toConsumableArray(seg[1]));
    return path.toString();
  }).map(function (pathStr, idx) {
    return _react["default"].createElement("path", {
      d: pathStr,
      key: idx
    });
  });
  return _react["default"].createElement("g", {
    className: "vis-debug-graph"
  }, paths);
});