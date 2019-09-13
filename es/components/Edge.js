'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.pathDimensionFunctions = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _underscore = _interopRequireDefault(require("underscore"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var d3 = _interopRequireWildcard(require("d3"));

var _Node = _interopRequireDefault(require("./Node"));

var _parsingFunctions = require("./parsing-functions");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function (o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function (o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pathDimensionFunctions = {
  'drawBezierEdge': function drawBezierEdge(startPt, endPt, columnSpacing, rowSpacing, nodeEdgeLedgeWidths) {
    var ledgeWidths = nodeEdgeLedgeWidths;
    var path = d3.path();
    path.moveTo(startPt.x, startPt.y);
    path.lineTo(startPt.x + ledgeWidths[0], startPt.y);
    var nodeXDif = Math.abs(endPt.x - startPt.x);
    var bezierStartPt = {
      'x': startPt.x + ledgeWidths[0],
      'y': startPt.y
    };
    var bezierEndPt = {
      'x': endPt.x - ledgeWidths[1],
      'y': endPt.y
    };

    if (nodeXDif > columnSpacing) {
        bezierStartPt.x += Math.max(0, nodeXDif - columnSpacing * (Math.abs(endPt.y - startPt.y) / rowSpacing * 2.5));
      }

    var bezierXDif = Math.abs(bezierStartPt.x - bezierEndPt.x);
    var controlPoints = [{
      'x': bezierStartPt.x + bezierXDif * 0.5,
      'y': startPt.y
    }, {
      'x': bezierEndPt.x - bezierXDif * 0.5,
      'y': endPt.y
    }];

    if (startPt.x > endPt.x) {
      var dif = Math.max(rowSpacing || 75);
      controlPoints[0].y += dif * (endPt.y >= startPt.y ? 1 : -1);
      controlPoints[1].y += dif * (endPt.y - startPt.y > rowSpacing ? -1 : 1);
      controlPoints[1].x = endPt.x - Math.abs(endPt.x - startPt.x) * .5;
    }

    path.bezierCurveTo(controlPoints[0].x, controlPoints[0].y, controlPoints[1].x, controlPoints[1].y, bezierEndPt.x, endPt.y);
    path.lineTo(endPt.x, endPt.y);
    return path.toString();
  },
  'drawStraightLineCurved': (0, _memoizeOne["default"])(function (startPt, endPt, curveRadius) {
    var radius = Math.min(curveRadius, Math.abs(startPt.y - endPt.y) / 2);
    var arcYOffset = Math.min(Math.max(endPt.y - startPt.y, -radius), radius);
    var path = d3.path();
    path.moveTo(startPt.x, startPt.y);
    path.lineTo(startPt.x + (endPt.x - startPt.x) / 2 - radius, startPt.y);
    path.arcTo(startPt.x + (endPt.x - startPt.x) / 2, startPt.y, startPt.x + (endPt.x - startPt.x) / 2, startPt.y + arcYOffset, radius);
    path.lineTo(startPt.x + (endPt.x - startPt.x) / 2, endPt.y - arcYOffset);
    path.arcTo(startPt.x + (endPt.x - startPt.x) / 2, endPt.y, startPt.x + (endPt.x - startPt.x) / 2 + radius, endPt.y, radius);
    path.lineTo(endPt.x, endPt.y);
    return path.toString();
  }),
  'drawBezierEdgeVertices': function drawBezierEdgeVertices(startPt, endPt, vertices, nodeEdgeLedgeWidths) {
    var adjVertices = vertices.map(function (v) {
      return v.slice();
    });
    adjVertices[0][0] = startPt && startPt.x || adjVertices[0][0];
    adjVertices[adjVertices.length - 1][0] = endPt && endPt.x || adjVertices[adjVertices.length - 1][0];

    if (nodeEdgeLedgeWidths[0]) {
      adjVertices.unshift([adjVertices[0][0], adjVertices[0][1]]);
      adjVertices[1][0] += nodeEdgeLedgeWidths[0];
    }

    if (nodeEdgeLedgeWidths[1]) {
      adjVertices.push([adjVertices[adjVertices.length - 1][0], adjVertices[adjVertices.length - 1][1]]);
      adjVertices[adjVertices.length - 2][0] -= nodeEdgeLedgeWidths[0];
    }

    adjVertices[0][0] = startPt && startPt.x || adjVertices[0][0];
    adjVertices[adjVertices.length - 1][0] = endPt && endPt.x || adjVertices[adjVertices.length - 1][0];
    var lineGenFxn = d3.line().x(function (d) {
      return d[0];
    }).y(function (d) {
      return d[1];
    }).curve(d3.curveMonotoneX);
    return lineGenFxn(adjVertices);
  },
  'drawStraightEdge': function drawStraightEdge(startPt, endPt) {
    var path = d3.path();
    path.moveTo(startPt.x, startPt.y);
    path.lineTo(endPt.x, endPt.y);
    path.closePath();
    return path.toString();
  }
};
exports.pathDimensionFunctions = pathDimensionFunctions;

var Edge = function (_React$Component) {
  _inherits(Edge, _React$Component);

  _createClass(Edge, null, [{
    key: "isSelected",
    value: function isSelected(edge, selectedNode) {
      return _Node["default"].isSelected(edge.source, selectedNode) || _Node["default"].isSelected(edge.target, selectedNode);
    }
  }, {
    key: "isRelated",
    value: function isRelated(edge, selectedNode) {
      return _Node["default"].isRelated(edge.source, selectedNode);
    }
  }, {
    key: "isDistantlySelected",
    value: function isDistantlySelected(edge, selectedNode) {
      if (!selectedNode) return false;

      function checkInput(node) {
        return _Node["default"].isSelected(edge.target, node);
      }

      function checkOutput(node) {
        return _Node["default"].isSelected(edge.source, node);
      }

      var selectedInputs = selectedNode && (selectedNode.inputNodes || selectedNode.outputOf && [selectedNode.outputOf]) || null;

      if (Array.isArray(selectedInputs) && selectedInputs.length > 0) {
        var resultsHistory = _underscore["default"].flatten(selectedInputs.map(function (sI) {
          return (0, _parsingFunctions.traceNodePathAndRun)(sI, checkInput, 'input', selectedNode);
        }), false);

        if (_underscore["default"].any(resultsHistory)) return true;
      }

      var selectedOutputs = selectedNode && (selectedNode.outputNodes || selectedNode.inputOf && selectedNode.inputOf) || null;

      if (Array.isArray(selectedOutputs) && selectedOutputs.length > 0) {
        var resultsFuture = _underscore["default"].flatten(selectedOutputs.map(function (sO) {
          return (0, _parsingFunctions.traceNodePathAndRun)(sO, checkOutput, 'output', selectedNode);
        }), false);

        if (_underscore["default"].any(resultsFuture)) return true;
      }

      return false;
    }
  }, {
    key: "isDisabled",
    value: function isDisabled(edge) {
      var isNodeDisabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (typeof isNodeDisabled === 'boolean') return isNodeDisabled;
      return typeof isNodeDisabled === 'function' && (isNodeDisabled(edge.source) || isNodeDisabled(edge.target));
    }
  }, {
    key: "didNodeCoordinatesChange",
    value: function didNodeCoordinatesChange(nextProps, pastProps) {
      if (nextProps.startX !== pastProps.startX || nextProps.startY !== pastProps.startY || nextProps.endX !== pastProps.endX || nextProps.endY !== pastProps.endY) return true;
      return false;
    }
  }, {
    key: "pathArrowsMarkers",
    value: function pathArrowsMarkers() {
      return _react["default"].createElement("defs", null, _react["default"].createElement("marker", {
        id: "pathArrowBlack",
        viewBox: "0 0 15 15",
        refX: "0",
        refY: "5",
        orient: "auto",
        markerUnits: "strokeWidth",
        markerWidth: "6",
        markerHeight: "5"
      }, _react["default"].createElement("path", {
        d: "M 0 0 L 10 5 L 0 10 Z",
        className: "pathArrow-marker marker-color-black"
      })), _react["default"].createElement("marker", {
        id: "pathArrowGray",
        viewBox: "0 0 15 15",
        refX: "0",
        refY: "5",
        orient: "auto",
        markerUnits: "strokeWidth",
        markerWidth: "6",
        markerHeight: "5"
      }, _react["default"].createElement("path", {
        d: "M 0 0 L 10 5 L 0 10 Z",
        className: "pathArrow-marker marker-color-gray"
      })), _react["default"].createElement("marker", {
        id: "pathArrowLightGray",
        viewBox: "0 0 15 15",
        refX: "0",
        refY: "5",
        orient: "auto",
        markerUnits: "strokeWidth",
        markerWidth: "6",
        markerHeight: "5"
      }, _react["default"].createElement("path", {
        d: "M 0 0 L 10 5 L 0 10 Z",
        className: "pathArrow-marker marker-color-light-gray"
      })));
    }
  }]);

  function Edge(props) {
    var _this;

    _classCallCheck(this, Edge);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Edge).call(this, props));
    _this.generatePathDimension = _this.generatePathDimension.bind(_assertThisInitialized(_this));
    _this.transitionPathDimensions = _this.transitionPathDimensions.bind(_assertThisInitialized(_this));
    _this.memoized = {
      isDistantlySelected: (0, _memoizeOne["default"])(Edge.isDistantlySelected),
      isRelated: (0, _memoizeOne["default"])(Edge.isRelated),
      isDisabled: (0, _memoizeOne["default"])(Edge.isDisabled),
      d: {
        drawBezierEdge: (0, _memoizeOne["default"])(pathDimensionFunctions.drawBezierEdge),
        drawBezierEdgeVertices: (0, _memoizeOne["default"])(pathDimensionFunctions.drawBezierEdgeVertices),
        drawStraightLineCurved: (0, _memoizeOne["default"])(pathDimensionFunctions.drawStraightLineCurved),
        drawStraightEdge: (0, _memoizeOne["default"])(pathDimensionFunctions.drawStraightEdge)
      }
    };
    _this.getComputedProperties = _this.getComputedProperties.bind(_assertThisInitialized(_this));
    _this.state = {
      'pathDimension': _this.generatePathDimension()
    };
    _this.pathRef = _react["default"].createRef();
    return _this;
  }

  _createClass(Edge, [{
    key: "getComputedProperties",
    value: function getComputedProperties() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var edge = props.edge,
          selectedNode = props.selectedNode,
          isNodeDisabled = props.isNodeDisabled;
      var disabled = this.memoized.isDisabled(edge, isNodeDisabled);

      if (disabled || !selectedNode) {
        return {
          disabled: disabled,
          'selected': false,
          'related': false
        };
      }

      var selected = Edge.isSelected(edge, selectedNode);
      var related = this.memoized.isRelated(edge, selectedNode);
      var distantlySelected = selected || selectedNode && this.memoized.isDistantlySelected(edge, selectedNode, disabled) || false;
      return {
        disabled: disabled,
        selected: selected,
        related: related,
        distantlySelected: distantlySelected
      };
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(pastProps) {
      var _this$props = this.props,
          startX = _this$props.startX,
          startY = _this$props.startY,
          endX = _this$props.endX,
          endY = _this$props.endY,
          edge = _this$props.edge;

      if (Edge.didNodeCoordinatesChange(this.props, pastProps)) {
        if (!this.shouldDoTransitionOfEdge()) {
          this.setState({
            'pathDimension': this.generatePathDimension()
          });
        } else {
          var startEndPtCoords = [{
            'x': pastProps.startX,
            'y': pastProps.startY
          }, {
            'x': startX,
            'y': startY
          }, {
            'x': pastProps.endX,
            'y': pastProps.endY
          }, {
            'x': endX,
            'y': endY
          }];

          if (edge.vertices && pastProps.edge.vertices && edge.vertices.length === pastProps.edge.vertices.length) {
            this.transitionPathDimensions.apply(this, startEndPtCoords.concat([pastProps.edge.vertices, edge.vertices]));
          } else {
            this.transitionPathDimensions.apply(this, startEndPtCoords);
          }
        }
      } else if (!_underscore["default"].isEqual(this.getPathOffsets(), this.getPathOffsets(pastProps))) {
        this.setState({
          'pathDimension': this.generatePathDimension()
        });
      }
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (Edge.didNodeCoordinatesChange(nextProps, this.props)) {
        return true;
      }

      if (this.state.pathDimension !== nextState.pathDimension) {
        return true;
      }

      var propKeys = _underscore["default"].without(_underscore["default"].keys(nextProps), 'scrollContainerWrapperElement', 'scrollContainerWrapperMounted', 'nodes', 'edges', 'href', 'renderDetailPane', 'isNodeCurrentContext', 'contentWidth', 'onNodeClick', 'edgeCount');

      var propKeysLen = propKeys.length;
      var i;

      for (i = 0; i < propKeysLen; i++) {
        if (this.props[propKeys[i]] !== nextProps[propKeys[i]]) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "shouldDoTransitionOfEdge",
    value: function shouldDoTransitionOfEdge() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      if (props.noTransition) return false;
      if (props.edgeCount > 60) return false;
      return true;
    }
  }, {
    key: "transitionPathDimensions",
    value: function transitionPathDimensions(startPtA, startPtB, endPtA, endPtB, startVertices, endVertices) {
      var _this2 = this;

      var interpolateSourceX = d3.interpolateNumber(startPtA.x, startPtB.x);
      var interpolateSourceY = d3.interpolateNumber(startPtA.y, startPtB.y);
      var interpolateTargetX = d3.interpolateNumber(endPtA.x, endPtB.x);
      var interpolateTargetY = d3.interpolateNumber(endPtA.y, endPtB.y);
      var interpolationFxnPerVertex = null;

      if (startVertices && endVertices) {
        interpolationFxnPerVertex = startVertices.map(function (startV, idx) {
          return [d3.interpolateNumber(startV[0], endVertices[idx][0]), d3.interpolateNumber(startV[1], endVertices[idx][1])];
        });
      }

      var pathElem = this.pathRef.current;
      if (!pathElem) return;
      d3.select(this).interrupt().transition().ease(d3.easeQuadOut).duration(500).tween("changeDimension", function changeTween() {
        return function (t) {
          var nextCoords = [{
            'x': interpolateSourceX(t),
            'y': interpolateSourceY(t)
          }, {
            'x': interpolateTargetX(t),
            'y': interpolateTargetY(t)
          }];
          var nextVs = null;

          if (interpolationFxnPerVertex) {
            nextVs = interpolationFxnPerVertex.map(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  interpX = _ref2[0],
                  interpY = _ref2[1];

              return [interpX(t), interpY(t)];
            });
          }

          pathElem.setAttribute('d', _this2.generatePathDimension.apply(_this2, nextCoords.concat([nextVs])));
        };
      }).on('end', function () {
        _this2.setState({
          'pathDimension': _this2.generatePathDimension()
        });
      });
    }
  }, {
    key: "getPathOffsets",
    value: function getPathOffsets() {
      var startOffset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
      var endOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -5;
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.props;
      var edge = props.edge,
          pathArrows = props.pathArrows;

      var _this$getComputedProp = this.getComputedProperties(props),
          disabled = _this$getComputedProp.disabled,
          selected = _this$getComputedProp.selected,
          related = _this$getComputedProp.related,
          distantlySelected = _this$getComputedProp.distantlySelected;

      if (pathArrows) endOffset -= 10;
      if (selected || related) endOffset -= 5;
      if (distantlySelected) endOffset -= 2;
      if (edge.source.isCurrentContext) startOffset += 5;
      if (edge.target.isCurrentContext) endOffset -= 5;
      return {
        startOffset: startOffset,
        endOffset: endOffset
      };
    }
  }, {
    key: "generatePathDimension",
    value: function generatePathDimension() {
      var startPtOverride = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var endPtOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var edgeVerticesOverride = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var _this$props2 = this.props,
          edgeStyle = _this$props2.edgeStyle,
          startX = _this$props2.startX,
          startY = _this$props2.startY,
          endX = _this$props2.endX,
          endY = _this$props2.endY,
          columnWidth = _this$props2.columnWidth,
          curveRadius = _this$props2.curveRadius,
          columnSpacing = _this$props2.columnSpacing,
          rowSpacing = _this$props2.rowSpacing,
          nodeEdgeLedgeWidths = _this$props2.nodeEdgeLedgeWidths,
          _this$props2$edge$ver = _this$props2.edge.vertices,
          customEdgeVertices = _this$props2$edge$ver === void 0 ? null : _this$props2$edge$ver;

      var _this$getPathOffsets = this.getPathOffsets(),
          startOffset = _this$getPathOffsets.startOffset,
          endOffset = _this$getPathOffsets.endOffset;

      var startPt = {
        'x': (startPtOverride && startPtOverride.x || startX) + columnWidth + startOffset,
        'y': startPtOverride && startPtOverride.y || startY
      };
      var endPt = {
        'x': (endPtOverride && endPtOverride.x || endX) + endOffset,
        'y': endPtOverride && endPtOverride.y || endY
      };

      if (customEdgeVertices || edgeVerticesOverride) {
        return this.memoized.d.drawBezierEdgeVertices(startPt, endPt, edgeVerticesOverride || customEdgeVertices, nodeEdgeLedgeWidths);
      }

      if (edgeStyle === 'straight') {
        return this.memoized.d.drawStraightEdge(startPt, endPt);
      }

      if (edgeStyle === 'curve') {
        return this.memoized.d.drawStraightLineCurved(startPt, endPt, curveRadius);
      }

      if (edgeStyle === 'bezier') {
        return this.memoized.d.drawBezierEdge(startPt, endPt, columnSpacing, rowSpacing, nodeEdgeLedgeWidths);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          edge = _this$props3.edge,
          pathArrows = _this$props3.pathArrows,
          style = _this$props3.style;
      var pathDimension = this.state.pathDimension;

      var _this$getComputedProp2 = this.getComputedProperties(),
          disabled = _this$getComputedProp2.disabled,
          selected = _this$getComputedProp2.selected,
          related = _this$getComputedProp2.related,
          distantlySelected = _this$getComputedProp2.distantlySelected;

      var markerEnd;

      if (!pathArrows) {
        markerEnd = null;
      } else if (selected || related || distantlySelected) {
        markerEnd = 'pathArrowBlack';
      } else if (disabled) {
        markerEnd = 'pathArrowLightGray';
      } else {
        markerEnd = 'pathArrowGray';
      }

      return _react["default"].createElement("path", {
        d: pathDimension,
        ref: this.pathRef,
        className: "edge-path" + (disabled ? ' disabled' : ''),
        "data-edge-selected": selected || distantlySelected,
        "data-edge-related": related,
        "data-source": edge.source.name,
        "data-target": edge.target.name,
        style: style,
        markerEnd: markerEnd && "url(#" + markerEnd + ")"
      });
    }
  }]);

  return Edge;
}(_react["default"].Component);

exports["default"] = Edge;

_defineProperty(Edge, "defaultProps", {
  'edgeStyle': 'bezier',
  'curveRadius': 12
});