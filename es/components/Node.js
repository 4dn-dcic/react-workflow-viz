'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.DefaultNodeElement = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

var _underscore = _interopRequireDefault(require("underscore"));

var _parsingFunctions = require("./parsing-functions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function (o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function (o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DefaultNodeElement = function (_React$PureComponent) {
  _inherits(DefaultNodeElement, _React$PureComponent);

  function DefaultNodeElement() {
    _classCallCheck(this, DefaultNodeElement);

    return _possibleConstructorReturn(this, _getPrototypeOf(DefaultNodeElement).apply(this, arguments));
  }

  _createClass(DefaultNodeElement, [{
    key: "icon",
    value: function icon() {
      var _this$props$node = this.props.node,
          type = _this$props$node.type,
          format = _this$props$node.format;
      var iconClass;

      if (type === 'input' || type === 'output') {
        var formats = format;

        if (typeof formats === 'undefined') {
          iconClass = 'question';
        } else if (typeof formats === 'string') {
          formats = formats.toLowerCase();

          if (formats.indexOf('file') > -1) {
            iconClass = 'file-text-o';
          } else if (formats.indexOf('parameter') > -1 || formats.indexOf('int') > -1 || formats.indexOf('string') > -1) {
            iconClass = 'wrench';
          }
        }
      } else if (type === 'step') {
        iconClass = 'cogs';
      }

      if (!iconClass) return null;
      return _react["default"].createElement("i", {
        className: "icon icon-fw icon-" + iconClass
      });
    }
  }, {
    key: "tooltip",
    value: function tooltip() {
      var node = this.props.node;
      var output = '';

      if (node.nodeType === 'step') {
        output += '<small>Step ' + ((node.column - 1) / 2 + 1) + '</small>';
      } else {
        var nodeType = node.nodeType;
        nodeType = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
        output += '<small>' + nodeType + '</small>';
      }

      output += '<h5 class="text-600 tooltip-title">' + (node.title || node.name) + '</h5>';

      if (typeof node.description === 'string' || node.meta && typeof node.meta.description === 'string') {
        output += '<div>' + (node.description || node.meta.description) + '</div>';
      }

      return output;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          node = _this$props.node,
          title = _this$props.title,
          columnWidth = _this$props.columnWidth;
      var style = node.nodeType === 'input' || node.nodeType === 'output' ? {
        width: columnWidth || 100
      } : null;
      return _react["default"].createElement("div", {
        className: "node-visible-element",
        "data-tip": this.tooltip(),
        "data-place": "top",
        "data-html": true,
        style: style
      }, _react["default"].createElement("div", {
        className: "node-name"
      }, this.icon(), title || node.title || node.name));
    }
  }]);

  return DefaultNodeElement;
}(_react["default"].PureComponent);

exports.DefaultNodeElement = DefaultNodeElement;

_defineProperty(DefaultNodeElement, "propTypes", {
  'node': _propTypes["default"].object,
  'disabled': _propTypes["default"].bool,
  'selected': _propTypes["default"].bool,
  'related': _propTypes["default"].oneOfType([_propTypes["default"].bool, _propTypes["default"].string]),
  'columnWidth': _propTypes["default"].number
});

var Node = function (_React$Component) {
  _inherits(Node, _React$Component);

  _createClass(Node, null, [{
    key: "isSelected",
    value: function isSelected(currentNode, selectedNode) {
      if (!selectedNode) return false;
      if (selectedNode === currentNode) return true;
      return false;
    }
  }, {
    key: "isInSelectionPath",
    value: function isInSelectionPath(currentNode, selectedNode) {
      if (!selectedNode) return false;

      function check(nodeBeingTraversed) {
        return Node.isSelected(currentNode, nodeBeingTraversed);
      }

      var selectedInputs = selectedNode && (selectedNode.inputNodes || selectedNode.outputOf && [selectedNode.outputOf]) || null,
          selectedOutputs = selectedNode && (selectedNode.outputNodes || selectedNode.inputOf) || null,
          results;

      if (Array.isArray(selectedInputs) && selectedInputs.length > 0) {
        results = _underscore["default"].flatten(_underscore["default"].map(selectedInputs, function (sI) {
          return (0, _parsingFunctions.traceNodePathAndRun)(sI, check, 'input', selectedNode);
        }), false);
        if (_underscore["default"].any(results)) return true;
      }

      if (Array.isArray(selectedOutputs) && selectedOutputs.length > 0) {
        results = _underscore["default"].flatten(_underscore["default"].map(selectedOutputs, function (sO) {
          return (0, _parsingFunctions.traceNodePathAndRun)(sO, check, 'output', selectedNode);
        }), false);
        if (_underscore["default"].any(results)) return true;
      }

      return false;
    }
  }, {
    key: "findCommonStepNodesInputInto",
    value: function findCommonStepNodesInputInto() {
      var nodes = Array.from(arguments),
          nodeInputOfLists = _underscore["default"].filter(_underscore["default"].pluck(nodes, 'inputOf'), function (ioList) {
        return Array.isArray(ioList) && ioList.length > 0;
      });

      if (nodeInputOfLists.length !== nodes.length) return false;
      return _underscore["default"].intersection.apply(_underscore["default"], _toConsumableArray(nodeInputOfLists));
    }
  }, {
    key: "isInputOfSameStep",
    value: function isInputOfSameStep() {
      return Node.findCommonStepNodesInputInto.apply(Node, arguments).length > 0;
    }
  }, {
    key: "isRelated",
    value: function isRelated(currentNode, selectedNode) {
      if (!selectedNode) return false;

      if (selectedNode.name === currentNode.name || _underscore["default"].any((currentNode._source || []).concat(currentNode._target || []), function (s) {
        return s.name === selectedNode.name;
      })) {
        if (currentNode.nodeType === 'input' || currentNode.nodeType === 'output') {
          return Node.isInputOfSameStep(currentNode, selectedNode);
        }

        if (currentNode.nodeType === 'input-group') {
          return Node.isInputOfSameStep(currentNode, selectedNode) && Node.isFromSameWorkflowType(currentNode, selectedNode);
        }
      }

      return false;
    }
  }, {
    key: "isFromSameWorkflowType",
    value: function isFromSameWorkflowType(currentNode, selectedNode) {
      if (typeof currentNode.meta.workflow === 'string' && typeof selectedNode.meta.workflow === 'string' && selectedNode.meta.workflow === currentNode.meta.workflow) {
        return true;
      }

      if (typeof selectedNode.meta.workflow === 'string' && Array.isArray(currentNode._source)) {
        if (_underscore["default"].any(currentNode._source, function (s) {
          return typeof s.workflow === 'string' && s.workflow === selectedNode.meta.workflow;
        })) {
          return true;
        }
      }

      if (typeof currentNode.meta.workflow === 'string' && Array.isArray(selectedNode._source)) {
        if (_underscore["default"].any(selectedNode._source, function (s) {
          return typeof s.workflow === 'string' && s.workflow === currentNode.meta.workflow;
        })) {
          return true;
        }
      }

      return false;
    }
  }]);

  function Node(props) {
    var _this;

    _classCallCheck(this, Node);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Node).call(this, props));
    _this.isInSelectionPath = (0, _memoizeOne["default"])(Node.isInSelectionPath.bind(_assertThisInitialized(_this)));
    _this.isRelated = (0, _memoizeOne["default"])(Node.isRelated.bind(_assertThisInitialized(_this)));
    _this.isDisabled = (0, _memoizeOne["default"])(_this.isDisabled.bind(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(Node, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props2 = this.props,
          countInActiveContext = _this$props2.countInActiveContext,
          lastActiveContextNode = _this$props2.lastActiveContextNode,
          node = _this$props2.node,
          scrollContainerWrapperElement = _this$props2.scrollContainerWrapperElement,
          columnWidth = _this$props2.columnWidth,
          columnSpacing = _this$props2.columnSpacing;
      var sw = scrollContainerWrapperElement;

      if (node.isCurrentContext && sw && (countInActiveContext === 1 || countInActiveContext > 1 && lastActiveContextNode === node)) {
        var scrollLeft = sw.scrollLeft;
        var containerWidth = sw.offsetWidth || sw.clientWidth;
        var nodeXEnd = node.x + columnWidth + columnSpacing;

        if (nodeXEnd > containerWidth + scrollLeft) {
          sw.scrollLeft = nodeXEnd - containerWidth;
        }
      }
    }
  }, {
    key: "isDisabled",
    value: function isDisabled(node, isNodeDisabled) {
      if (typeof isNodeDisabled === 'function') {
        return isNodeDisabled(node);
      }

      if (typeof isNodeDisabled === 'boolean') {
        return isNodeDisabled;
      }

      return false;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          node = _this$props3.node,
          isNodeDisabled = _this$props3.isNodeDisabled,
          className = _this$props3.className,
          columnWidth = _this$props3.columnWidth,
          renderNodeElement = _this$props3.renderNodeElement,
          selectedNode = _this$props3.selectedNode,
          disabled = typeof node.disabled !== 'undefined' ? node.disabled : this.isDisabled(node, isNodeDisabled),
          isCurrentContext = typeof node.isCurrentContext !== 'undefined' ? node.isCurrentContext : null,
          classNameList = ["node", "node-type-" + node.nodeType],
          selected = !disabled && Node.isSelected(node, selectedNode) || false,
          related = !disabled && this.isRelated(node, selectedNode) || false,
          inSelectionPath = selected || !disabled && this.isInSelectionPath(node, selectedNode) || false;
      if (disabled) classNameList.push('disabled');
      if (isCurrentContext) classNameList.push('current-context');
      if (typeof className === 'function') classNameList.push(className(node));else if (typeof className === 'string') classNameList.push(className);

      var visibleNodeProps = _underscore["default"].extend(_underscore["default"].omit(this.props, 'children', 'onMouseEnter', 'onMouseLeave', 'onClick', 'className', 'nodeElement'), {
        disabled: disabled,
        selected: selected,
        related: related,
        isCurrentContext: isCurrentContext,
        inSelectionPath: inSelectionPath
      });

      return _react["default"].createElement("div", {
        className: classNameList.join(' '),
        "data-node-key": node.id || node.name,
        "data-node-type": node.nodeType,
        "data-node-global": node.meta && node.meta.global === true,
        "data-node-selected": selected,
        "data-node-in-selection-path": inSelectionPath,
        "data-node-related": related,
        "data-node-type-detail": node.ioType && node.ioType.toLowerCase(),
        "data-node-column": node.column,
        style: {
          'top': node.y,
          'left': node.x,
          'width': columnWidth || 100,
          'zIndex': 2 + (node.indexInColumn || 0)
        }
      }, _react["default"].createElement("div", _extends({
        className: "inner",
        children: renderNodeElement(node, visibleNodeProps)
      }, _underscore["default"].pick(this.props, 'onMouseEnter', 'onMouseLeave'), {
        onClick: disabled ? null : this.props.onClick
      })));
    }
  }]);

  return Node;
}(_react["default"].Component);

exports["default"] = Node;