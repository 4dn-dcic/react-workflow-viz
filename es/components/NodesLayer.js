'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _underscore = _interopRequireDefault(require("underscore"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var _reactTransitionGroup = require("react-transition-group");

var _Node = _interopRequireDefault(require("./Node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var NodesLayer = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(NodesLayer, _React$PureComponent);

  var _super = _createSuper(NodesLayer);

  function NodesLayer(props) {
    var _this;

    _classCallCheck(this, NodesLayer);

    _this = _super.call(this, props);
    _this.memoized = {
      sortedNodes: (0, _memoizeOne["default"])(NodesLayer.sortedNodes),
      countInActiveContext: (0, _memoizeOne["default"])(NodesLayer.countInActiveContext),
      lastActiveContextNode: (0, _memoizeOne["default"])(NodesLayer.lastActiveContextNode)
    };
    return _this;
  }

  _createClass(NodesLayer, [{
    key: "renderNodeElements",
    value: function renderNodeElements() {
      var _this2 = this;

      if (!this.props.scrollContainerWrapperMounted) {
        return null;
      }

      var _this$props = this.props,
          nodes = _this$props.nodes,
          onNodeMouseEnter = _this$props.onNodeMouseEnter,
          onNodeMouseLeave = _this$props.onNodeMouseLeave,
          onNodeClick = _this$props.onNodeClick,
          nodeClassName = _this$props.nodeClassName;
      var sortedNodes = this.memoized.sortedNodes(nodes);
      var countInActiveContext = this.memoized.countInActiveContext(sortedNodes);
      var lastActiveContextNode = countInActiveContext === 0 ? null : this.memoized.lastActiveContextNode(sortedNodes);
      return _underscore["default"].map(sortedNodes, function (node, nodeIndex) {
        var nodeProps = _underscore["default"].extend(_underscore["default"].omit(_this2.props, 'children', 'nodes', 'width', 'innerWidth', 'outerWidth', 'windowWidth'), {
          node: node,
          countInActiveContext: countInActiveContext,
          lastActiveContextNode: lastActiveContextNode,
          'onMouseEnter': onNodeMouseEnter && onNodeMouseEnter.bind(onNodeMouseEnter, node),
          'onMouseLeave': onNodeMouseLeave && onNodeMouseLeave.bind(onNodeMouseLeave, node),
          'onClick': onNodeClick && onNodeClick.bind(onNodeClick, node),
          'key': node.id || node.name || nodeIndex,
          'className': nodeClassName
        });

        return /*#__PURE__*/_react["default"].createElement(_reactTransitionGroup.CSSTransition, {
          classNames: "workflow-node-transition",
          unmountOnExit: true,
          timeout: 500,
          key: nodeProps.key
        }, /*#__PURE__*/_react["default"].createElement(_Node["default"], nodeProps));
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          innerMargin = _this$props2.innerMargin,
          innerWidth = _this$props2.innerWidth,
          outerHeight = _this$props2.outerHeight,
          contentWidth = _this$props2.contentWidth,
          fullWidth = innerWidth + innerMargin.left + innerMargin.right,
          layerStyle = {
        'width': Math.max(contentWidth, fullWidth),
        'height': outerHeight
      };
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "nodes-layer-wrapper",
        style: layerStyle
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "nodes-layer",
        style: layerStyle
      }, /*#__PURE__*/_react["default"].createElement(_reactTransitionGroup.TransitionGroup, {
        component: null
      }, this.renderNodeElements())));
    }
  }], [{
    key: "sortedNodes",
    value: function sortedNodes(nodes) {
      // Sort nodes so on updates, they stay in same(-ish) order and can transition.
      return _underscore["default"].sortBy(nodes.slice(0), 'id');
    }
  }, {
    key: "countInActiveContext",
    value: function countInActiveContext(nodes) {
      return _underscore["default"].reduce(nodes, function (m, n) {
        return n.isCurrentContext ? ++m : m;
      }, 0);
    }
  }, {
    key: "lastActiveContextNode",
    value: function lastActiveContextNode(nodes) {
      return _underscore["default"].sortBy(_underscore["default"].filter(nodes, function (n) {
        return n.isCurrentContext;
      }), 'column').reverse()[0];
    }
  }]);

  return NodesLayer;
}(_react["default"].PureComponent);

exports["default"] = NodesLayer;

_defineProperty(NodesLayer, "defaultProps", {
  'onNodeMouseEnter': null,
  'onNodeMouseLeave': null,
  'onNodeClick': null
});