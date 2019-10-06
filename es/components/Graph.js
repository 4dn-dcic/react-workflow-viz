'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphParser = exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _underscore = _interopRequireDefault(require("underscore"));

var d3 = _interopRequireWildcard(require("d3"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var _StateContainer = _interopRequireDefault(require("./StateContainer"));

var _ScrollContainer = _interopRequireDefault(require("./ScrollContainer"));

var _NodesLayer = _interopRequireDefault(require("./NodesLayer"));

var _EdgesLayer = _interopRequireDefault(require("./EdgesLayer"));

var _DefaultDetailPane = require("./DefaultDetailPane");

var _Node = require("./Node");

var _parsingFunctions = require("./parsing-functions");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
var Graph =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Graph, _React$Component);

  _createClass(Graph, null, [{
    key: "getHeightFromNodes",
    value: function getHeightFromNodes(nodes, nodesPreSortFxn, rowSpacing) {
      // Run pre-sort fxn, e.g. to manually pre-arrange nodes into different columns.
      if (typeof nodesPreSortFxn === 'function') {
        nodes = nodesPreSortFxn(nodes.slice(0));
      }

      return Math.max((0, _underscore["default"])(nodes).chain().groupBy('column').pairs().reduce(function (maxCount, nodeSet) {
        return Math.max(nodeSet[1].length, maxCount);
      }, 0).value() * rowSpacing - rowSpacing);
    }
  }, {
    key: "getScrollableWidthFromNodes",
    value: function getScrollableWidthFromNodes(nodes, columnWidth, columnSpacing, innerMargin) {
      return (_underscore["default"].reduce(nodes, function (highestCol, node) {
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

  }, {
    key: "getNodesWithCoordinates",
    value: function getNodesWithCoordinates() {
      var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var viewportWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var contentWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var contentHeight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var innerMargin = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
      var rowSpacingType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'compact';
      var rowSpacing = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 75;
      var columnWidth = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 150;
      var columnSpacing = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 56;
      var isNodeCurrentContext = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;

      /** Vertically centers a single node within a column */
      function centerNode(n) {
        n.y = contentHeight / 2 + innerMargin.top;
        n.nodesInColumn = 1;
        n.indexInColumn = 0;
      }

      var nodesByColumnPairs, leftOffset, nodesWithCoords; // Arrange into lists of columns
      // Ensure we're sorted, using column _numbers_ (JS objs keyed by str).

      nodesByColumnPairs = _underscore["default"].sortBy(_underscore["default"].map(_underscore["default"].pairs(_underscore["default"].groupBy(nodes, 'column')), function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            columnNumStr = _ref2[0],
            nodesInColumn = _ref2[1];

        return [parseInt(columnNumStr), nodesInColumn];
      }), 0); // Set correct Y coordinate on each node depending on how many nodes are in each column.

      _underscore["default"].forEach(nodesByColumnPairs, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            columnNumber = _ref4[0],
            nodesInColumn = _ref4[1];

        var countInCol = nodesInColumn.length;
        nodesInColumn = _underscore["default"].sortBy(nodesInColumn, 'indexInColumn');

        if (rowSpacingType === 'compact') {
          if (countInCol === 1) centerNode(nodesInColumn[0]);else {
            var padding = Math.max(0, contentHeight - (countInCol - 1) * rowSpacing) / 2;

            _underscore["default"].forEach(nodesInColumn, function (nodeInCol, idx) {
              nodeInCol.y = (idx + 0) * rowSpacing + innerMargin.top + padding;
              nodeInCol.nodesInColumn = countInCol;
            });
          }
        } else if (rowSpacingType === 'stacked') {
          _underscore["default"].forEach(nodesInColumn, function (nodeInCol, idx) {
            if (!nodeInCol) return;
            nodeInCol.y = rowSpacing * idx + innerMargin.top; //num + (this.props.innerMargin.top + verticalMargin);

            nodeInCol.nodesInColumn = countInCol;
          });
        } else if (rowSpacingType === 'wide') {
          if (countInCol === 1) centerNode(nodesInColumn[0]);else {
            _underscore["default"].forEach(d3.range(0, contentHeight, contentHeight / (countInCol - 1)).concat([contentHeight]), function (yCoordinate, idx) {
              var nodeInCol = nodesInColumn[idx];
              if (!nodeInCol) return;
              nodeInCol.y = yCoordinate + innerMargin.top;
              nodeInCol.nodesInColumn = countInCol;
            });
          }
        } else {
          console.error("Prop 'rowSpacingType' not valid. Must be ", Graph.propTypes.rowSpacingType);
          throw new Error("Prop 'rowSpacingType' not valid.");
        }
      });

      nodesWithCoords = _underscore["default"].reduce(nodesByColumnPairs, function (m, _ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            columnNumber = _ref6[0],
            nodesInColumn = _ref6[1];

        return m.concat(nodesInColumn);
      }, []);
      leftOffset = innerMargin.left; // Center graph contents horizontally if needed.

      if (contentWidth && viewportWidth && contentWidth < viewportWidth) {
        leftOffset += (viewportWidth - contentWidth) / 2;
      } // Set correct X coordinate on each node depending on column and spacing prop.


      _underscore["default"].forEach(nodesWithCoords, function (node) {
        node.x = node.column * (columnWidth + columnSpacing) + leftOffset;
      }); // Finally, add boolean `isCurrentContext` flag to each node object if needed.


      if (typeof isNodeCurrentContext === 'function') {
        _underscore["default"].forEach(nodesWithCoords, function (node) {
          node.isCurrentContext = isNodeCurrentContext(node);
        });
      }

      return nodesWithCoords;
    }
  }]);

  function Graph(props) {
    var _this;

    _classCallCheck(this, Graph);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Graph).call(this, props));
    _this.height = _this.height.bind(_assertThisInitialized(_this));
    _this.nodesWithCoordinates = _this.nodesWithCoordinates.bind(_assertThisInitialized(_this));
    _this.state = {
      'mounted': false
    };
    _this.memoized = {
      getHeightFromNodes: (0, _memoizeOne["default"])(Graph.getHeightFromNodes),
      getScrollableWidthFromNodes: (0, _memoizeOne["default"])(Graph.getScrollableWidthFromNodes),
      getNodesWithCoordinates: (0, _memoizeOne["default"])(Graph.getNodesWithCoordinates)
    };
    return _this;
  }

  _createClass(Graph, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setState({
        'mounted': true
      });
    }
  }, {
    key: "height",
    value: function height() {
      var _this$props = this.props,
          nodes = _this$props.nodes,
          nodesPreSortFxn = _this$props.nodesPreSortFxn,
          rowSpacing = _this$props.rowSpacing;
      return this.memoized.getHeightFromNodes(nodes, nodesPreSortFxn, rowSpacing);
    }
  }, {
    key: "scrollableWidth",
    value: function scrollableWidth() {
      var _this$props2 = this.props,
          nodes = _this$props2.nodes,
          columnWidth = _this$props2.columnWidth,
          columnSpacing = _this$props2.columnSpacing,
          innerMargin = _this$props2.innerMargin;
      return this.memoized.getScrollableWidthFromNodes(nodes, columnWidth, columnSpacing, innerMargin);
    }
  }, {
    key: "nodesWithCoordinates",
    value: function nodesWithCoordinates(viewportWidth, contentWidth, contentHeight) {
      var _this$props3 = this.props,
          nodes = _this$props3.nodes,
          innerMargin = _this$props3.innerMargin,
          rowSpacingType = _this$props3.rowSpacingType,
          rowSpacing = _this$props3.rowSpacing,
          columnWidth = _this$props3.columnWidth,
          columnSpacing = _this$props3.columnSpacing,
          isNodeCurrentContext = _this$props3.isNodeCurrentContext;
      return this.memoized.getNodesWithCoordinates(nodes, viewportWidth, contentWidth, contentHeight, innerMargin, rowSpacingType, rowSpacing, columnWidth, columnSpacing, isNodeCurrentContext);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          width = _this$props4.width,
          innerMargin = _this$props4.innerMargin,
          edges = _this$props4.edges,
          minimumHeight = _this$props4.minimumHeight;
      var mounted = this.state.mounted;
      var innerHeight = this.height();
      var contentWidth = this.scrollableWidth();
      var innerWidth = width;

      if (!mounted) {
        return _react["default"].createElement("div", {
          key: "outer"
        }, _react["default"].createElement("div", null, "\xA0"));
      }

      if (innerMargin && (innerMargin.left || innerMargin.right)) {
        innerWidth -= innerMargin.left || 0;
        innerWidth -= innerMargin.right || 0;
      }

      var nodes = this.nodesWithCoordinates(innerWidth, contentWidth, innerHeight);
      var graphHeight = innerHeight + (innerMargin.top || 0) + (innerMargin.bottom || 0);
      /* TODO: later
      var spacerCount = _.reduce(nodes, function(m,n){ if (n.nodeType === 'spacer'){ return m + 1; } else { return m; }}, 0);
      if (spacerCount){
          height += (spacerCount * this.props.columnSpacing);
          graphHeight += (spacerCount * this.props.columnSpacing);
      }
      */

      return _react["default"].createElement("div", {
        className: "workflow-chart-outer-container",
        key: "outer"
      }, _react["default"].createElement("div", {
        className: "workflow-chart-inner-container"
      }, _react["default"].createElement(_StateContainer["default"], _extends({
        nodes: nodes,
        edges: edges,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        contentWidth: contentWidth,
        width: width
      }, _underscore["default"].pick(this.props, 'innerMargin', 'columnWidth', 'columnSpacing', 'pathArrows', 'href', 'onNodeClick', 'renderDetailPane')), _react["default"].createElement(_ScrollContainer["default"], {
        outerHeight: graphHeight,
        minHeight: minimumHeight
      }, _react["default"].createElement(_EdgesLayer["default"], _underscore["default"].pick(this.props, 'isNodeDisabled', 'isNodeCurrentContext', 'isNodeSelected', 'edgeStyle', 'rowSpacing', 'columnWidth', 'columnSpacing', 'nodeEdgeLedgeWidths')), _react["default"].createElement(_NodesLayer["default"], _underscore["default"].pick(this.props, 'renderNodeElement', 'isNodeDisabled', 'isNodeCurrentContext', 'nodeClassName'))))));
    }
  }]);

  return Graph;
}(_react["default"].Component);
/**
 * Optional component to wrap Graph and pass steps in.
 * @todo Test for (lack of) bidirectionality in data and fix.
 */


exports["default"] = Graph;

_defineProperty(Graph, "propTypes", {
  'isNodeDisabled': _propTypes["default"].func,
  'innerMargin': _propTypes["default"].shape({
    'top': _propTypes["default"].number.isRequired,
    'bottom': _propTypes["default"].number.isRequired,
    'left': _propTypes["default"].number.isRequired,
    'right': _propTypes["default"].number.isRequired
  }).isRequired,
  'renderNodeElement': _propTypes["default"].func.isRequired,
  'renderDetailPane': _propTypes["default"].func.isRequired,
  'nodes': _propTypes["default"].arrayOf(_propTypes["default"].shape({
    'column': _propTypes["default"].number.isRequired,
    'name': _propTypes["default"].string.isRequired,
    'nodeType': _propTypes["default"].string.isRequired,
    'ioType': _propTypes["default"].string,
    'id': _propTypes["default"].string,
    // Optional unique ID if node names might be same.
    'outputOf': _propTypes["default"].object,
    // Unused currently
    'inputOf': _propTypes["default"].arrayOf(_propTypes["default"].object),
    // Unused currently
    'description': _propTypes["default"].string,
    'meta': _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].shape({
      'target': _propTypes["default"].arrayOf(_propTypes["default"].shape({
        'name': _propTypes["default"].string.isRequired,
        'type': _propTypes["default"].string.isRequired,
        'step': _propTypes["default"].string
      }))
    })])
  })).isRequired,
  'edges': _propTypes["default"].arrayOf(_propTypes["default"].shape({
    'source': _propTypes["default"].object.isRequired,
    'target': _propTypes["default"].object.isRequired,
    'capacity': _propTypes["default"].string
  })).isRequired,
  'nodeTitle': _propTypes["default"].func,
  'rowSpacingType': _propTypes["default"].oneOf(['compact', 'wide', 'stacked'])
});

_defineProperty(Graph, "defaultProps", {
  'height': null,
  // Unused, should be set to nodes count in highest column * rowSpacing + innerMargins.
  'width': null,
  'columnSpacing': 100,
  'columnWidth': 150,
  'rowSpacing': 80,
  'rowSpacingType': 'compact',
  'pathArrows': true,
  'renderDetailPane': function renderDetailPane(selectedNode, props) {
    return _react["default"].createElement(_DefaultDetailPane.DefaultDetailPane, _extends({}, props, {
      selectedNode: selectedNode
    }));
  },
  'renderNodeElement': function renderNodeElement(node, props) {
    return _react["default"].createElement(_Node.DefaultNodeElement, _extends({}, props, {
      node: node
    }));
  },
  'onNodeClick': null,
  // Use StateContainer.defaultOnNodeClick
  'innerMargin': {
    'top': 80,
    'bottom': 80,
    'left': 40,
    'right': 40
  },
  'minimumHeight': 75,
  'edgeStyle': 'bezier',
  'isNodeCurrentContext': function isNodeCurrentContext() {
    return false;
  },
  'nodeClassName': function nodeClassName() {
    return '';
  },
  'nodeEdgeLedgeWidths': [3, 5]
});

var GraphParser =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(GraphParser, _React$Component2);

  function GraphParser(props) {
    var _this2;

    _classCallCheck(this, GraphParser);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(GraphParser).call(this, props));
    _this2.memoized = {
      parseAnalysisSteps: (0, _memoizeOne["default"])(_parsingFunctions.parseAnalysisSteps),
      parseBasicIOAnalysisSteps: (0, _memoizeOne["default"])(_parsingFunctions.parseBasicIOAnalysisSteps)
    };
    return _this2;
  }

  _createClass(GraphParser, [{
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
          steps = _this$props5.steps,
          parentItem = _this$props5.parentItem,
          children = _this$props5.children,
          parsingOptions = _this$props5.parsingOptions;
      var parseBasicIO = parsingOptions.parseBasicIO;
      var graphData;

      if (parseBasicIO) {
        graphData = this.memoized.parseBasicIOAnalysisSteps(steps, parentItem, parsingOptions);
      } else {
        graphData = this.memoized.parseAnalysisSteps(steps, parsingOptions);
      }

      return _react["default"].Children.map(children, function (child) {
        return _react["default"].cloneElement(child, graphData);
      });
    }
  }]);

  return GraphParser;
}(_react["default"].Component);

exports.GraphParser = GraphParser;

_defineProperty(GraphParser, "defaultProps", {
  'parsingOptions': {
    showReferenceFiles: true,
    showParameters: true,
    showIndirectFiles: true,
    parseBasicIO: false
  },
  'parentItem': {
    name: "Workflow"
  }
});