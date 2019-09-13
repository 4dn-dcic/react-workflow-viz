'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _underscore = _interopRequireDefault(require("underscore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function (o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function (o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ScrollContainer = function (_React$PureComponent) {
  _inherits(ScrollContainer, _React$PureComponent);

  function ScrollContainer(props) {
    var _this;

    _classCallCheck(this, ScrollContainer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ScrollContainer).call(this, props));
    _this.state = {
      'mounted': false,
      'isHeightDecreasing': null,
      'outerHeight': props.outerHeight,
      'pastHeight': null
    };
    _this.containerRef = _react["default"].createRef();
    _this.heightTimer = null;
    return _this;
  }

  _createClass(ScrollContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setState({
        'mounted': true
      });
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      var updateOuterHeight = this.props.outerHeight;

      if (updateOuterHeight !== prevProps.outerHeight) {
        var isHeightDecreasing = updateOuterHeight < prevProps.outerHeight;
        this.setState({
          'isHeightDecreasing': isHeightDecreasing,
          'pastHeight': isHeightDecreasing ? prevProps.outerHeight : null,
          'outerHeight': updateOuterHeight
        }, function () {
          _this2.heightTimer && clearTimeout(_this2.heightTimer);
          _this2.heightTimer = setTimeout(function () {
            _this2.setState({
              'isHeightDecreasing': null,
              'pastHeight': null
            });
          }, 500);
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props = this.props,
          innerMargin = _this$props.innerMargin,
          innerWidth = _this$props.innerWidth,
          children = _this$props.children,
          contentWidth = _this$props.contentWidth,
          width = _this$props.width,
          minHeight = _this$props.minHeight;
      var _this$state = this.state,
          outerHeight = _this$state.outerHeight,
          pastHeight = _this$state.pastHeight,
          isHeightDecreasing = _this$state.isHeightDecreasing,
          mounted = _this$state.mounted;
      var innerCls = 'scroll-container' + (isHeightDecreasing ? ' height-decreasing' : '') + (isHeightDecreasing === false ? ' height-increasing' : '');
      var innerStyle = {
        'width': Math.max(contentWidth, width),
        'height': outerHeight,
        'overflowY': outerHeight < minHeight ? "hidden" : null
      };

      if (minHeight > outerHeight) {
        innerStyle.paddingTop = innerStyle.paddingBottom = Math.floor((minHeight - outerHeight) / 2);
      }

      return _react["default"].createElement("div", {
        className: "scroll-container-wrapper",
        ref: this.containerRef,
        style: {
          width: width,
          minHeight: minHeight
        }
      }, _react["default"].createElement("div", {
        className: innerCls,
        style: innerStyle
      }, _react["default"].Children.map(children, function (child) {
        return _react["default"].cloneElement(child, _underscore["default"].extend(_underscore["default"].omit(_this3.props, 'children'), {
          'scrollContainerWrapperElement': _this3.containerRef.current || null,
          'scrollContainerWrapperMounted': mounted,
          'outerHeight': pastHeight || outerHeight
        }));
      })));
    }
  }]);

  return ScrollContainer;
}(_react["default"].PureComponent);

exports["default"] = ScrollContainer;