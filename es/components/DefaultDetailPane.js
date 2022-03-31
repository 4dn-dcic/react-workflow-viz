'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultDetailPane = DefaultDetailPane;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function DefaultDetailPane(props) {
  var node = props.selectedNode;
  if (!node) return null;
  console.log("selected node", node);

  if (node.nodeType === 'step') {} else {
    node.ioType || node.nodeType;
  }

  var textContent = JSON.stringify(node.meta, null, 4);
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "detail-pane"
  }, /*#__PURE__*/_react["default"].createElement("h4", null, "Create your own detail pane component and pass in a ", /*#__PURE__*/_react["default"].createElement("code", null, "renderDetailPane"), " prop (function) which returns it."), /*#__PURE__*/_react["default"].createElement("h5", null, "Could add ", /*#__PURE__*/_react["default"].createElement("code", null, "display: flex"), " & related CSS styling to visualization container & pane to have detail pane show at left or right, if desired."), /*#__PURE__*/_react["default"].createElement("div", {
    className: "detail-pane-body"
  }, /*#__PURE__*/_react["default"].createElement("pre", {
    style: {
      fontFamily: "monospace",
      whiteSpace: "pre-wrap"
    }
  }, textContent)));
}

DefaultDetailPane.propTypes = {
  'selectedNode': _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].oneOf([null])])
};
DefaultDetailPane.defaultProps = {
  'selectedNode': null
};