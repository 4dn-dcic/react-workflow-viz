'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathDimensionFunctions = exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _underscore = _interopRequireDefault(require("underscore"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var d3 = _interopRequireWildcard(require("d3"));

var _Node = _interopRequireDefault(require("./Node"));

var _parsingFunctions = require("./parsing-functions");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function (o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function (o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pathDimensionFunctions = {
  /**
   * Draw a bezier path from startPt to endPt.
   *
   * @param {Object} startPt - Object with x and y coordinates.
   * @param {Object} endPt - Object with x and y coordinates.
   * @param {Number[]} [ledgeWidths] - Little widths of line right before/after node. To allow for horizontal arrow.
   * @returns {string} 'd' attribute value for an SVG path.
   */
  'drawBezierEdge': function drawBezierEdge(startPt, endPt, columnSpacing, rowSpacing, nodeEdgeLedgeWidths) {
    var ledgeWidths = nodeEdgeLedgeWidths;
    var path = d3.path();
    path.moveTo(startPt.x, startPt.y);
    path.lineTo(startPt.x + ledgeWidths[0], startPt.y); // First ledge

    var nodeXDif = Math.abs(endPt.x - startPt.x);
    var bezierStartPt = {
      'x': startPt.x + ledgeWidths[0],
      'y': startPt.y
    };
    var bezierEndPt = {
      'x': endPt.x - ledgeWidths[1],
      'y': endPt.y
    };

    if (nodeXDif > columnSpacing
    /* && Math.abs(endPt.y - startPt.y) <= this.props.rowSpacing * 2*/
    ) {
      // Draw straight line until last section. Length depending on how close together y-axes are (revert to default bezier if far apart).
      bezierStartPt.x += Math.max(0, nodeXDif - columnSpacing * (Math.abs(endPt.y - startPt.y) / rowSpacing * 2.5)); //path.lineTo(bezierStartPt.x, bezierStartPt.y);
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
      // Our input edge appears AFTER the target.
      //var dif = Math.min(1, 5 / Math.max(1, Math.abs(endPt.y - startPt.y) )) * (this.props.rowSpacing || 75);
      var dif = Math.max(rowSpacing || 75);
      controlPoints[0].y += dif * (endPt.y >= startPt.y ? 1 : -1);
      controlPoints[1].y += dif * (endPt.y - startPt.y > rowSpacing ? -1 : 1);
      controlPoints[1].x = endPt.x - Math.abs(endPt.x - startPt.x) * .5;
    }

    path.bezierCurveTo(controlPoints[0].x, controlPoints[0].y, // - pathAscend,
    controlPoints[1].x, controlPoints[1].y, // + pathAscend,
    bezierEndPt.x, endPt.y); // Final ledge

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

    adjVertices[0][0] = startPt && startPt.x || adjVertices[0][0]; // + nodeEdgeLedgeWidths[0];

    adjVertices[adjVertices.length - 1][0] = endPt && endPt.x || adjVertices[adjVertices.length - 1][0]; // - nodeEdgeLedgeWidths[1];

    var lineGenFxn = d3.line().x(function (d) {
      return d[0];
    }).y(function (d) {
      return d[1];
    }).curve(d3.curveMonotoneX);
    return lineGenFxn(adjVertices);
  },

  /**
   * @deprecated
   */
  'drawStraightEdge': function drawStraightEdge(startPt, endPt) {
    var path = d3.path();
    path.moveTo(startPt.x, startPt.y);
    path.lineTo(endPt.x, endPt.y);
    path.closePath();
    return path.toString();
  }
};
exports.pathDimensionFunctions = pathDimensionFunctions;

var Edge = /*#__PURE__*/function (_React$Component) {
  _inherits(Edge, _React$Component);

  var _super = _createSuper(Edge);

  function Edge(props) {
    var _this;

    _classCallCheck(this, Edge);

    _this = _super.call(this, props);
    _this.generatePathDimension = _this.generatePathDimension.bind(_assertThisInitialized(_this));
    _this.transitionPathDimensions = _this.transitionPathDimensions.bind(_assertThisInitialized(_this)); // Create own memoized copy/instance of intensive static functions.
    // Otherwise if left static, will be re-ran each time as many edges call it.

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
    }; // Alternative implementation of transition -
    // adjust pathRef.current `d` attribute manually

    _this.pathRef = /*#__PURE__*/_react["default"].createRef();
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
    /**
     * If any of our nodes' coordinates have updated, update state.pathDimension either via a D3 animation tween acting on setState or instantly via setState.
     * Whether instant or gradual dimension update is based on result of `this.shouldDoTransitionOfEdge()` : boolean
     */

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
          // Instant
          this.setState({
            'pathDimension': this.generatePathDimension()
          });
        } else {
          // Animate
          var startEndPtCoords = [{
            'x': pastProps.startX,
            'y': pastProps.startY
          }, // StartA
          {
            'x': startX,
            'y': startY
          }, // StartB
          {
            'x': pastProps.endX,
            'y': pastProps.endY
          }, // StartA
          {
            'x': endX,
            'y': endY
          } // StartB
          ];

          if (edge.vertices && pastProps.edge.vertices && edge.vertices.length === pastProps.edge.vertices.length) {
            this.transitionPathDimensions.apply(this, startEndPtCoords.concat([pastProps.edge.vertices, edge.vertices]));
          } else {
            this.transitionPathDimensions.apply(this, startEndPtCoords);
          }
        }
      } else if (!_underscore["default"].isEqual(this.getPathOffsets(), this.getPathOffsets(pastProps))) {
        // Instant
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
      } // If state.pathDimension changes we _do not_ update, since DOM elements should already be transitioned.


      return false;
    }
  }, {
    key: "shouldDoTransitionOfEdge",
    value: function shouldDoTransitionOfEdge() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      if (props.noTransition) return false; // Until we adjust all Edges to transition within a single DOM update/redraw,
      // we optimize by not transitioning unless <= 50 edges.
      // This is because each Edge currently launches own transition
      // which cascades into an exponential number of transitions/viewport-updates.

      if (props.edgeCount > 60) return false;
      return true;
    }
    /**
     * Transitions edge dimensions over time.
     * Updates `state.pathDimension` incrementally using d3.transition().
     *
     * @todo
     * In future, all transitions could be done in `EdgesLayer` instead of `Edge`,
     * this would allow us to batch all the DOM updates into a single function wrapped
     * in a `requestAnimationFrame` call. This will require some dynamic programming as
     * well as caching of ege:node-coords to detect changes and run transitions.
     * The changeTween itself should transition _all_ Edges that need to be transitioned.
     */

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

      var pathElem = this.pathRef.current; // Necessary if using alternate transition approach(es).

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

      return /*#__PURE__*/_react["default"].createElement("path", {
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
  }], [{
    key: "isSelected",
    value: function isSelected(edge, selectedNode) {
      return _Node["default"].isSelected(edge.source, selectedNode) || _Node["default"].isSelected(edge.target, selectedNode);
    }
  }, {
    key: "isRelated",
    value: function isRelated(edge, selectedNode) {
      return _Node["default"].isRelated(edge.source, selectedNode); // Enable the following later _if_ we go beyond 1 input node deep.
      //return (
      //    Node.isRelated(edge.source, selectedNode) ||
      //    Node.isRelated(edge.target, selectedNode)
      //);
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
      return /*#__PURE__*/_react["default"].createElement("defs", null, /*#__PURE__*/_react["default"].createElement("marker", {
        id: "pathArrowBlack",
        viewBox: "0 0 15 15",
        refX: "0",
        refY: "5",
        orient: "auto",
        markerUnits: "strokeWidth",
        markerWidth: "6",
        markerHeight: "5"
      }, /*#__PURE__*/_react["default"].createElement("path", {
        d: "M 0 0 L 10 5 L 0 10 Z",
        className: "pathArrow-marker marker-color-black"
      })), /*#__PURE__*/_react["default"].createElement("marker", {
        id: "pathArrowGray",
        viewBox: "0 0 15 15",
        refX: "0",
        refY: "5",
        orient: "auto",
        markerUnits: "strokeWidth",
        markerWidth: "6",
        markerHeight: "5"
      }, /*#__PURE__*/_react["default"].createElement("path", {
        d: "M 0 0 L 10 5 L 0 10 Z",
        className: "pathArrow-marker marker-color-gray"
      })), /*#__PURE__*/_react["default"].createElement("marker", {
        id: "pathArrowLightGray",
        viewBox: "0 0 15 15",
        refX: "0",
        refY: "5",
        orient: "auto",
        markerUnits: "strokeWidth",
        markerWidth: "6",
        markerHeight: "5"
      }, /*#__PURE__*/_react["default"].createElement("path", {
        d: "M 0 0 L 10 5 L 0 10 Z",
        className: "pathArrow-marker marker-color-light-gray"
      })));
    }
  }]);

  return Edge;
}(_react["default"].Component);

exports["default"] = Edge;

_defineProperty(Edge, "defaultProps", {
  'edgeStyle': 'bezier',
  'curveRadius': 12
});