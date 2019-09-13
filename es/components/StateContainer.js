'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _underscore = _interopRequireDefault(require("underscore"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function (o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function (o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var memoizedFindNode = (0, _memoizeOne["default"])(function (nodes, name, nodeType) {
  var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return _underscore["default"].find(nodes, function (n) {
    if (n.name !== name) return false;
    if (n.nodeType !== nodeType) return false;
    if (id !== null && n.id !== id) return false;
    return true;
  });
});

var StateContainer = function (_React$PureComponent) {
  _inherits(StateContainer, _React$PureComponent);

  _createClass(StateContainer, null, [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      if (state.selectedNode) {
        var foundNode = memoizedFindNode(props.nodes, state.selectedNode.name, state.selectedNode.nodeType, state.selectedNode.id || null);

        if (foundNode) {
          return {
            'selectedNode': foundNode
          };
        } else {
          return {
            'selectedNode': null
          };
        }
      }

      return null;
    }
  }]);

  function StateContainer(props) {
    var _this;

    _classCallCheck(this, StateContainer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(StateContainer).call(this, props));
    _this.defaultOnNodeClick = _this.defaultOnNodeClick.bind(_assertThisInitialized(_this));
    _this.handleNodeClick = _this.handleNodeClick.bind(_assertThisInitialized(_this));
    _this.deselectNode = _this.deselectNode.bind(_assertThisInitialized(_this));
    _this.state = {
      'selectedNode': null
    };
    return _this;
  }

  _createClass(StateContainer, [{
    key: "defaultOnNodeClick",
    value: function defaultOnNodeClick(node) {
      this.setState(function (prevState) {
        if (prevState.selectedNode === node) {
          return {
            'selectedNode': null
          };
        } else {
          return {
            'selectedNode': node
          };
        }
      });
    }
  }, {
    key: "handleNodeClick",
    value: function handleNodeClick(node, evt) {
      var onNodeClick = this.props.onNodeClick;
      var selectedNode = this.state.selectedNode;

      if (typeof onNodeClick === 'function') {
        onNodeClick(node, selectedNode, evt);
      } else {
        this.defaultOnNodeClick(node, selectedNode, evt);
      }
    }
  }, {
    key: "deselectNode",
    value: function deselectNode() {
      this.setState({
        selectedNode: null
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          children = _this$props.children,
          renderDetailPane = _this$props.renderDetailPane,
          passProps = _objectWithoutProperties(_this$props, ["children", "renderDetailPane"]);

      var selectedNode = this.state.selectedNode;
      var detailPane = null;

      if (typeof renderDetailPane === 'function') {
        detailPane = renderDetailPane(selectedNode, _objectSpread({}, this.props, {
          deselectNode: this.deselectNode
        }));
      }

      return _react["default"].createElement("div", {
        className: "state-container",
        "data-is-node-selected": !!selectedNode
      }, _react["default"].Children.map(children, function (child) {
        return _react["default"].cloneElement(child, _objectSpread({}, passProps, {}, _this2.state, {
          onNodeClick: _this2.handleNodeClick
        }));
      }), detailPane);
    }
  }]);

  return StateContainer;
}(_react["default"].PureComponent);

exports["default"] = StateContainer;