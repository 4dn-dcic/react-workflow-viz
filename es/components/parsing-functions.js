'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseAnalysisSteps = parseAnalysisSteps;
exports.traceNodePathAndRun = traceNodePathAndRun;
exports.correctColumnAssignments = correctColumnAssignments;
exports.parseBasicIOAnalysisSteps = parseBasicIOAnalysisSteps;
exports.filterOutParametersFromGraphData = filterOutParametersFromGraphData;
exports.filterOutReferenceFilesFromGraphData = filterOutReferenceFilesFromGraphData;
exports.filterOutIndirectFilesFromGraphData = filterOutIndirectFilesFromGraphData;
exports.nodesPreSortFxn = nodesPreSortFxn;
exports.nodesInColumnSortFxn = nodesInColumnSortFxn;
exports.nodesInColumnPostSortFxn = nodesInColumnPostSortFxn;
exports.DEFAULT_PARSING_OPTIONS = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _memoizeOne = _interopRequireDefault(require("memoize-one"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var StepIOArgumentTargetOrSource;
var StepIOArgumentRunData;
var StepIOArgument;
var Step;
var NodeRunData;
var NodeMeta;
var Node;
var Edge;
var ParsingOptions;
var DEFAULT_PARSING_OPTIONS = {
  'direction': 'output',
  'skipSortOnColumns': [1],
  'dontCorrectColumns': false,
  'nodesPreSortFxn': nodesPreSortFxn,
  'nodesInColumnSortFxn': nodesInColumnSortFxn,
  'nodesInColumnPostSortFxn': nodesInColumnPostSortFxn,
  'showReferenceFiles': true,
  'showParameters': true,
  'showIndirectFiles': true
};
exports.DEFAULT_PARSING_OPTIONS = DEFAULT_PARSING_OPTIONS;

function parseAnalysisSteps(analysis_steps) {
  var parsingOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var parsingOpts = _objectSpread({}, DEFAULT_PARSING_OPTIONS, {}, parsingOptions);

  var nodes = [];
  var edges = [];
  var ioIdsUsed = {};
  var processedSteps = {};

  function ioNodeID(stepIOArg) {
    var readOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return preventDuplicateNodeID(stepIOArg.id || stepIOArg.name, readOnly);
  }

  function ioNodeName(stepIOArg) {
    var nameToUse = stepIOArg.name || null;
    var isGlobal = stepIOArg.meta && stepIOArg.meta.global === true;

    if (isGlobal) {
      var list = null;

      if (Array.isArray(stepIOArg.target)) {
        list = stepIOArg.target;
      }

      if (Array.isArray(stepIOArg.source)) {
        if (list) list = list.concat(stepIOArg.source);else list = stepIOArg.source;
      }

      if (!list) return nameToUse;
      var i,
          listLength = list.length;

      for (i = 0; i < listLength; i++) {
        if (list[i] && typeof list[i].step === 'undefined' && typeof list[i].name === 'string') {
          nameToUse = list[i].name;
          break;
        }
      }
    }

    return nameToUse;
  }

  function preventDuplicateNodeID(id) {
    var readOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (typeof id !== 'string') throw new Error('param id is not a string.');
    id = id.replace(/(~\d+)/, '');

    if (readOnly) {
      return typeof ioIdsUsed[id] === 'number' && ioIdsUsed[id] > 1 ? id + '~' + ioIdsUsed[id] : id;
    }

    if (typeof ioIdsUsed[id] === 'undefined') {
      ioIdsUsed[id] = 1;
      return id;
    }

    return id + '~' + ++ioIdsUsed[id];
  }

  function compareTwoFilesByID(file1, file2) {
    if (!file1 || !file2) return false;

    if (typeof file1 === 'string' && typeof file2 === 'string' && file1 === file2) {
      return true;
    }

    if (_typeof(file1) === 'object' && _typeof(file2) === 'object' && (file1['@id'] || 'a') === (file2['@id'] || 'b')) {
      return true;
    }

    if (_typeof(file1) === 'object' && typeof file2 === 'string' && (file1['@id'] || 'a') === file2) {
      return true;
    }

    if (typeof file1 === 'string' && _typeof(file2) === 'object' && file1 === (file2['@id'] || 'b')) {
      return true;
    }

    return false;
  }

  function generateStepNode(step, column) {
    return {
      'nodeType': 'step',
      'name': step.name,
      '_inputs': step.inputs,
      '_outputs': step.outputs,
      'meta': _underscore["default"].extend({}, step.meta || {}, _underscore["default"].omit(step, 'inputs', 'outputs', 'meta')),
      'column': column
    };
  }

  function generateIONode(stepIOArgument, column, stepNode, nodeType) {
    var readOnly = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    if (nodeType !== 'input' && nodeType !== 'output') throw new Error('Incorrect type, must be one of input or output.');
    nodeType === 'input' ? 'source' : 'target';
    var namesOnSteps = {};
    namesOnSteps[stepNode.name] = stepIOArgument.name;
    var ioType = stepIOArgument.meta && typeof stepIOArgument.meta.type === 'string' && stepIOArgument.meta.type.toLowerCase();
    var ioNode = {
      'column': column,
      'ioType': ioType,
      'id': ioNodeID(stepIOArgument, readOnly),
      'name': ioNodeName(stepIOArgument),
      'argNamesOnSteps': namesOnSteps,
      'nodeType': nodeType,
      '_source': stepIOArgument.source,
      '_target': stepIOArgument.target,
      'meta': _underscore["default"].extend({}, stepIOArgument.meta || {}, _underscore["default"].omit(stepIOArgument, 'name', 'meta', 'source', 'target'))
    };
    if (nodeType === 'input') ioNode.inputOf = [stepNode];else if (nodeType === 'output') ioNode.outputOf = stepNode;
    return ioNode;
  }

  function expandIONodes(stepIOArgument, column, stepNode, nodeType, readOnly) {
    if (typeof stepIOArgument.run_data === 'undefined' || !stepIOArgument.run_data.file && !stepIOArgument.run_data.value || stepIOArgument.run_data.file && (!Array.isArray(stepIOArgument.run_data.file) || stepIOArgument.run_data.file.length === 0) || stepIOArgument.run_data.value && (!Array.isArray(stepIOArgument.run_data.value) || stepIOArgument.run_data.value.length === 0)) {
      return [generateIONode(stepIOArgument, column, stepNode, nodeType, readOnly)];
    }

    function expandRunDataArraysToIndividualNodes(value_list) {
      var propertyToExpand = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'file';
      return _underscore["default"].map(value_list, function (val, idx) {
        if (Array.isArray(val)) {
          idx = val[0];
          val = val[1];
        }

        if (!val) console.error('No value(s) on', value_list, stepNode);
        var id = ioNodeName(stepIOArgument) + '.';

        var run_data = _underscore["default"].extend({}, stepIOArgument.run_data, {
          'meta': stepIOArgument.run_data.meta && stepIOArgument.run_data.meta[idx] || null
        });

        if (propertyToExpand === 'file') {
          id += val && val.accession || val && val.uuid || idx;
          run_data.file = val;
        } else if (propertyToExpand === 'value') {
          id += idx;
          run_data.value = val;
        }

        return generateIONode(_underscore["default"].extend({}, stepIOArgument, {
          'name': ioNodeName(stepIOArgument),
          'id': id,
          'run_data': run_data
        }), column, stepNode, nodeType, readOnly);
      });
    }

    var valuesForArgument, isParameterArgument;

    if (stepIOArgument.run_data && Array.isArray(stepIOArgument.run_data.value) && !stepIOArgument.run_data.file) {
      isParameterArgument = true;
      valuesForArgument = stepIOArgument.run_data.value;
    } else {
      isParameterArgument = false;
      valuesForArgument = stepIOArgument.run_data.file;
    }

    var groupSources = _underscore["default"].filter(stepIOArgument.source || [], function (s) {
      return typeof s.grouped_by === 'string' && typeof s[s.grouped_by] !== 'undefined' && typeof s.for_file === 'string';
    });

    if (groupSources.length > 0) {
      var groups = _underscore["default"].reduce(groupSources, function (filesByGroup, groupSource) {
        if (typeof filesByGroup[groupSource.grouped_by] === 'undefined') {
          filesByGroup[groupSource.grouped_by] = {};
        }

        if (typeof filesByGroup[groupSource.grouped_by][groupSource[groupSource.grouped_by]] === 'undefined') {
          filesByGroup[groupSource.grouped_by][groupSource[groupSource.grouped_by]] = new Set();
        }

        filesByGroup[groupSource.grouped_by][groupSource[groupSource.grouped_by]].add(groupSource.for_file);
        return filesByGroup;
      }, {}),
          groupKeys = _underscore["default"].keys(groups),
          filesNotInGroups = [],
          filesByGroup = _underscore["default"].reduce(stepIOArgument.run_data.file, function (m, file, idx) {
        var incl = false;

        _underscore["default"].forEach(groupKeys, function (groupingTypeKey) {
          _underscore["default"].forEach(_underscore["default"].keys(groups[groupingTypeKey]), function (group) {
            if (groups[groupingTypeKey][group].has(file['@id'] || file)) {
              if (typeof m[groupingTypeKey] === 'undefined') {
                m[groupingTypeKey] = {};
              }

              if (typeof m[groupingTypeKey][group] === 'undefined') {
                m[groupingTypeKey][group] = new Set();
              }

              m[groupingTypeKey][group].add(file);
              incl = true;
            }
          });
        });

        if (!incl) {
          filesNotInGroups.push([idx, file]);
        }

        return m;
      }, {});

      var groupingName = 'workflow';

      var groupNodes = _underscore["default"].reduce(_underscore["default"].pairs(filesByGroup[groupingName]), function (m, wfPair) {
        var namesOnSteps = {};
        namesOnSteps[stepNode.name] = stepIOArgument.name;
        var groupNode = {
          'column': column,
          'ioType': stepIOArgument.meta && stepIOArgument.meta.type || 'group',
          'id': ioNodeName(stepIOArgument) + '.group:' + groupingName + '.' + wfPair[0],
          'name': ioNodeName(stepIOArgument),
          'argNamesOnSteps': namesOnSteps,
          'nodeType': nodeType + '-group',
          '_source': stepIOArgument.source,
          '_target': stepIOArgument.target,
          'meta': _underscore["default"].extend({}, stepIOArgument.meta || {}, _underscore["default"].omit(stepIOArgument, 'name', 'meta', 'source', 'target')),
          'inputOf': [stepNode]
        };
        groupNode.meta[groupingName] = wfPair[0];
        m.push(groupNode);
        return m;
      }, []);

      return expandRunDataArraysToIndividualNodes(filesNotInGroups).concat(groupNodes);
    }

    return expandRunDataArraysToIndividualNodes(valuesForArgument, isParameterArgument ? 'value' : 'file');
  }

  function generateIONodesFromStep(step, column, stepNode) {
    var ioNodeType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'input';
    var stepIOTargetType = ioNodeType === 'input' ? 'source' : 'target';
    var oppIOTargetType = ioNodeType === 'input' ? 'target' : 'source';
    var ioNodesMatched = [];
    var ioNodesCreated = [];

    function areInputRunDataPresentAndEqual(node, stepIO) {
      if (stepIO[stepIOTargetType].length > 1 || typeof stepIO[stepIOTargetType][0].step !== 'undefined') return false;
      return areAnyRunDataPresentAndEqual(node, stepIO);
    }

    function areAnyRunDataPresentAndEqual(node, stepIO) {
      if (!node.meta || !node.meta.run_data) return false;
      var stepIOFiles = stepIO.run_data && Array.isArray(stepIO.run_data.file) && stepIO.run_data.file || [];
      return node.meta.run_data.file && _underscore["default"].any(stepIOFiles, compareTwoFilesByID.bind(null, node.meta.run_data.file)) || typeof node.meta.run_data.value !== 'undefined' && stepIO.run_data && typeof stepIO.run_data.value !== 'undefined' && node.meta.run_data.value === stepIO.run_data.value;
    }

    _underscore["default"].forEach(step[ioNodeType + 's'], function (stepIO) {
      if (!Array.isArray(stepIO[stepIOTargetType])) return;
      var isGlobalInputArg = stepIO[stepIOTargetType].length === 1 && typeof stepIO[stepIOTargetType][0].step === 'undefined' && !(stepIO.meta && stepIO.meta.cardinality === 'array');
      var ioNodeIDsMatched = {};

      var currentIONodesMatched = _underscore["default"].filter(nodes, function (n) {
        if (n.nodeType === 'step') return false;

        if (ioNodeType === 'input' && isGlobalInputArg) {
          if (Array.isArray(n['_' + stepIOTargetType]) && n['_' + stepIOTargetType].length === 1 && typeof n['_' + stepIOTargetType][0].step === 'undefined' && (n['_' + stepIOTargetType][0].name === stepIO[stepIOTargetType][0].name || areInputRunDataPresentAndEqual(n, stepIO))) {
            if (!(n.meta && n.meta.run_data) || !stepIO.run_data || areInputRunDataPresentAndEqual(n, stepIO)) {
              ioNodeIDsMatched[n.id] = ioNodeName(stepIO);
              return true;
            }
          }
        } else if (!isGlobalInputArg && _underscore["default"].any(stepIO[stepIOTargetType], function (s) {
          if (s.step && n.argNamesOnSteps[s.step] === s.name && Array.isArray(n['_' + oppIOTargetType]) && _underscore["default"].any(n['_' + oppIOTargetType], function (t) {
            return t.step === step.name;
          })) {
            if (!(n.meta && n.meta.run_data) || !stepIO.run_data || areAnyRunDataPresentAndEqual(n, stepIO)) {
              return true;
            }
          }

          if (Array.isArray(n['_' + oppIOTargetType]) && _underscore["default"].any(n['_' + oppIOTargetType], function (t) {
            if (t.step && t.step === step.name && stepIO.name === t.name) {
              if (!(n.meta && n.meta.run_data) || !stepIO.run_data || areAnyRunDataPresentAndEqual(n, stepIO)) {
                return true;
              }
            }

            return false;
          })) return true;

          if (ioNodeType === 'input' && typeof s.grouped_by === 'string' && typeof s[s.grouped_by] === 'string') {
            if (n.meta && Array.isArray(n['_' + stepIOTargetType]) && _underscore["default"].any(n['_' + stepIOTargetType], function (nodeSource) {
              return typeof nodeSource.grouped_by === 'string' && typeof nodeSource[nodeSource.grouped_by] === 'string' && nodeSource[nodeSource.grouped_by] === s[s.grouped_by];
            })) {
              var nodeBeingCheckedGroupFiles = _underscore["default"].pluck(_underscore["default"].filter(n['_' + stepIOTargetType], function (nS) {
                return typeof nS.for_file === 'string';
              }), 'for_file');

              return s.for_file && _underscore["default"].contains(nodeBeingCheckedGroupFiles, s.for_file) && true || false;
            }
          }

          return false;
        })) {
          ioNodeIDsMatched[n.id] = ioNodeName(stepIO);
          return true;
        }

        return false;
      });

      var ioNodesToCreate = expandIONodes(stepIO, column, stepNode, ioNodeType, true);

      if (currentIONodesMatched.length > 0) {
        ioNodesMatched = ioNodesMatched.concat(currentIONodesMatched);

        _underscore["default"].forEach(currentIONodesMatched, function (n) {
          try {
            var inNode,
                inNodes = _underscore["default"].where(ioNodesToCreate, {
              'name': ioNodeIDsMatched[n.id]
            });

            if (inNodes.length === 1) {
              inNode = inNodes[0];
            } else {
              inNode = _underscore["default"].find(inNodes, function (inMore) {
                if (inMore.meta.run_data && inMore.meta.run_data.file && n.meta.run_data && n.meta.run_data.file) {
                  var origFile = n.meta.run_data.file,
                      fileToCheck = inMore.meta.run_data.file;

                  if (!Array.isArray(origFile) && !Array.isArray(fileToCheck)) {
                    return compareTwoFilesByID(n.meta.run_data.file, inMore.meta.run_data.file);
                  } else if (Array.isArray(origFile) && !Array.isArray(fileToCheck)) {
                    return _underscore["default"].any(origFile, function (oF) {
                      return compareTwoFilesByID(oF, fileToCheck);
                    });
                  } else if (!Array.isArray(origFile) && Array.isArray(fileToCheck)) {
                    return _underscore["default"].any(fileToCheck, function (fTC) {
                      return compareTwoFilesByID(origFile, fTC);
                    });
                  } else if (Array.isArray(origFile) && Array.isArray(fileToCheck)) {
                    return _underscore["default"].any(fileToCheck, function (fTC) {
                      return _underscore["default"].any(origFile, function (oF) {
                        return compareTwoFilesByID(oF, fTC);
                      });
                    });
                  }
                }

                return false;
              });
            }

            if (!inNode) throw new Error(n.id + " new node version not found");
          } catch (e) {
            console.warn("Didn't find newly-created temporary node to extend from which was previously matched against node", n, stepIO, stepNode, e);
            return;
          }

          var combinedMeta = _underscore["default"].extend({}, n.meta, inNode.meta, {
            'global': n.meta.global || inNode.meta.global || false,
            'type': n.meta && n.meta.type || inNode.meta && inNode.meta.type,
            'file_format': n.meta && n.meta.file_format || inNode.meta && inNode.meta.file_format
          });

          if (n.meta.run_data && Array.isArray(n.meta.run_data.file)) {
            var runDataToUse = n.meta.run_data,
                runDataToUseFileIDs = _underscore["default"].pluck(runDataToUse.file, '@id');

            if (Array.isArray(inNode.meta.run_data.file)) {
              _underscore["default"].forEach(inNode.meta.run_data.file, function (f, idx) {
                if (runDataToUseFileIDs.indexOf(f['@id']) === -1) {
                  runDataToUse.file.push(f);
                  runDataToUse.meta.push(inNode.meta.run_data.meta[idx]);
                }
              });
            } else {
              if (runDataToUseFileIDs.indexOf(inNode.meta.run_data.file['@id']) === -1) {
                runDataToUse.file.push(inNode.meta.run_data.file);
                runDataToUse.meta.push(inNode.meta.run_data.meta);
              }
            }

            combinedMeta.run_data = runDataToUse;
          }

          _underscore["default"].extend(n, {
            'meta': combinedMeta,
            'name': ioNodeType === 'output' ? inNode.name || n.name : n.name || inNode.name,
            'argNamesOnSteps': _underscore["default"].extend(n.argNamesOnSteps, inNode.argNamesOnSteps),
            '_source': n._source || inNode._source,
            '_target': n._target || inNode._target,
            'ioType': n.ioType || inNode.ioType,
            'inputOf': _underscore["default"].sortBy((n.inputOf || []).concat(inNode.inputOf || []), 'id'),
            'nodeType': n.nodeType === 'output' || inNode.nodeType === 'output' ? 'output' : n.nodeType || inNode.nodeType
          });

          if (ioNodeType === 'input') {
            n.wasMatchedAsInputOf = (n.wasMatchedAsInputOf || []).concat(stepNode.name);
          } else {
            n.wasMatchedAsOutputOf = stepNode.name;
            n.outputOf = stepNode;
          }
        });
      }

      if (currentIONodesMatched.length < ioNodesToCreate.length) {
        var unmatchedIONodesToCreate = _underscore["default"].map(_underscore["default"].filter(ioNodesToCreate, function (n) {
          if (typeof ioNodeIDsMatched[n.id] !== 'undefined') return false;

          if (n.meta && n.meta.run_data && n.meta.run_data.file) {
            var fileToMatch = n.meta.run_data.file,
                filesToCheck = _underscore["default"].filter(_underscore["default"].map(currentIONodesMatched, function (n2) {
              return n2 && n2.meta && n2.meta.run_data && n2.meta.run_data.file || null;
            }), function (file) {
              return file !== null;
            });

            if (_underscore["default"].any(filesToCheck, compareTwoFilesByID.bind(null, fileToMatch))) {
              return false;
            }
          }

          return true;
        }), function (n) {
          n.id = preventDuplicateNodeID(n.id, false);

          if (ioNodeType === 'input') {
            n.generatedAsInputOf = (n.generatedAsInputOf || []).concat(stepNode.name);
          } else {
            n.generatedAsOutputOf = (n.generatedAsOutputOf || []).concat(stepNode.name);
          }

          return n;
        });

        nodes = nodes.concat(unmatchedIONodesToCreate);
        ioNodesCreated = ioNodesCreated.concat(unmatchedIONodesToCreate);
      }

      stepNode[ioNodeType + 'Nodes'] = _underscore["default"].sortBy(ioNodesCreated.concat(ioNodesMatched), 'id');

      if (stepNode[ioNodeType + 'Nodes'].length > 0) {
        _underscore["default"].forEach(stepNode[ioNodeType + 'Nodes'], function (n) {
          var existingEdge = _underscore["default"].find(edges, function (e) {
            if (e[stepIOTargetType] === n && e[oppIOTargetType] === stepNode) return true;
          });

          if (existingEdge) return;
          var newEdge = {};
          newEdge[stepIOTargetType] = n;
          newEdge[oppIOTargetType] = stepNode;
          newEdge.capacity = ioNodeType;
          edges.push(newEdge);
        });
      }
    });

    return {
      'created': ioNodesCreated,
      'matched': ioNodesMatched
    };
  }

  function findNextStepsFromIONode(ioNodes) {
    var targetPropertyName = parsingOpts.direction === 'output' ? '_target' : '_source';
    var nextSteps = new Set();

    _underscore["default"].forEach(ioNodes, function (n) {
      if (!Array.isArray(n[targetPropertyName])) return;

      _underscore["default"].forEach(n[targetPropertyName], function (t) {
        if (typeof t.step === 'string') {
          var matchedStep = _underscore["default"].findWhere(analysis_steps, {
            'name': t.step
          });

          if (matchedStep) {
            nextSteps.add(matchedStep);
          }
        }
      });
    });

    return _toConsumableArray(nextSteps);
  }

  function processStepInPath(step) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var stepNode = generateStepNode(step, (level + 1) * 2 - 1);

    if (parsingOpts.direction === 'output') {
      generateIONodesFromStep(step, (level + 1) * 2 - 2, stepNode, 'input');
      var outputNodes = generateIONodesFromStep(step, (level + 1) * 2, stepNode, 'output');
      nodes.push(stepNode);
      processedSteps[stepNode.name] = stepNode;

      _underscore["default"].forEach(findNextStepsFromIONode(outputNodes.created), function (nextStep) {
        if (typeof processedSteps[nextStep.name] === 'undefined') {
          processStepInPath(nextStep, level + 1);
        } else {
          generateIONodesFromStep(nextStep, (level + 2) * 2 - 2, processedSteps[nextStep.name], 'input');
        }
      });

      return stepNode;
    } else {
      throw new Error("Input-direction drawing not currently supported.");
    }
  }

  (function () {
    if (Array.isArray(analysis_steps) && analysis_steps.length > 0) {
      processStepInPath(analysis_steps[0]);

      for (var i = 0; i < 1000; i++) {
        if (_underscore["default"].keys(processedSteps).length < analysis_steps.length) {
          var nextSteps = _underscore["default"].filter(analysis_steps, function (s) {
            if (typeof processedSteps[s.name] === 'undefined') return true;
            return false;
          });

          if (nextSteps.length > 0) {
            processStepInPath(nextSteps[0]);
          }
        } else {
          break;
        }
      }
    }
  })();

  var graphData = {
    nodes: nodes,
    edges: edges
  };

  if (!parsingOpts.showParameters) {
    graphData = filterOutParametersFromGraphData(graphData);
  }

  if (!parsingOpts.showReferenceFiles) {
    graphData = filterOutReferenceFilesFromGraphData(graphData);
  }

  if (!parsingOpts.showIndirectFiles) {
    graphData = filterOutIndirectFilesFromGraphData(graphData);
  }

  var sortedNodes = _underscore["default"].sortBy(graphData.nodes, 'column');

  if (typeof parsingOpts.nodesPreSortFxn === 'function') {
    sortedNodes = parsingOpts.nodesPreSortFxn(sortedNodes);
  }

  var nodesByColumnPairs = _underscore["default"].pairs(_underscore["default"].groupBy(correctColumnAssignments(sortedNodes), 'column'));

  nodesByColumnPairs = _underscore["default"].map(nodesByColumnPairs, function (columnGroupPair) {
    _underscore["default"].forEach(columnGroupPair[1], function (n, i) {
      n.origIndexInColumn = i;
    });

    return [parseInt(columnGroupPair[0]), columnGroupPair[1]];
  });

  if (typeof parsingOpts.nodesInColumnSortFxn === 'function') {
    nodesByColumnPairs = _underscore["default"].map(nodesByColumnPairs, function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          columnGroupIdx = _ref2[0],
          columnGroupNodes = _ref2[1];

      var nodesInColumn;

      if (Array.isArray(parsingOpts.skipSortOnColumns) && parsingOpts.skipSortOnColumns.indexOf(columnGroupIdx) > -1) {
        nodesInColumn = columnGroupNodes.slice(0);
      } else {
        nodesInColumn = columnGroupNodes.sort(parsingOpts.nodesInColumnSortFxn);
      }

      _underscore["default"].forEach(nodesInColumn, function (n, i) {
        n.indexInColumn = i;
      });

      if (typeof parsingOpts.nodesInColumnPostSortFxn === 'function') {
        nodesInColumn = parsingOpts.nodesInColumnPostSortFxn(nodesInColumn, columnGroupIdx);

        _underscore["default"].forEach(nodesInColumn, function (n, i) {
          n.indexInColumn = i;
        });
      }

      return [columnGroupIdx, nodesInColumn];
    });
  }

  sortedNodes = _underscore["default"].reduce(nodesByColumnPairs, function (m, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        colIdx = _ref4[0],
        nodesInColumn = _ref4[1];

    return m.concat(nodesInColumn);
  }, []);
  return {
    'nodes': sortedNodes,
    'edges': graphData.edges
  };
}

function traceNodePathAndRun(nextNode, fxn) {
  var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'output';
  var lastNode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var depth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  if (typeof fxn !== 'function') return null;
  var nextNodes = direction === 'output' ? Array.isArray(nextNode.outputNodes) ? nextNode.outputNodes : Array.isArray(nextNode.inputOf) ? nextNode.inputOf : [] : direction === 'input' ? Array.isArray(nextNode.inputNodes) ? nextNode.inputNodes : nextNode.outputOf ? [nextNode.outputOf] : [] : [];
  var fxnResult = fxn(nextNode, lastNode, nextNodes);

  if (depth > 1000) {
    console.error("Reached max depth (1000) at node ", nextNode);
    return [fxnResult, null];
  }

  var nextResults = _underscore["default"].map(nextNodes, function (n) {
    return traceNodePathAndRun(n, fxn, direction, nextNode, depth + 1);
  });

  return [fxnResult, nextResults];
}

function correctColumnAssignments(graphData) {
  var nodes;
  if (Array.isArray(graphData)) nodes = graphData;else if (Array.isArray(graphData.nodes)) nodes = graphData.nodes;else throw new Error('No nodes provided.');

  var colCorrectFxn = function (node, lastNode) {
    if (typeof node.column !== 'number' || typeof lastNode.column !== 'number') {
      console.error('No column number on one of theses nodes', node, lastNode);
      return;
    }

    var currentColDifference = node.column - lastNode.column;

    if (currentColDifference < 1) {
      var colDifferenceToAdd = Math.abs(lastNode.column - node.column) + 1;
      node.column += colDifferenceToAdd;
    }
  };

  _underscore["default"].forEach(nodes, function (node) {
    if (typeof node.column !== 'number') {
      console.error('No column number on node', node);
      return;
    }

    if (Array.isArray(node.outputNodes) && node.outputNodes.length > 0) {
      var laggingOutputNodes = _underscore["default"].filter(node.outputNodes, function (oN) {
        if (typeof oN.column === 'number' && oN.column <= node.column) {
          return true;
        }

        return false;
      });

      _underscore["default"].forEach(laggingOutputNodes, function (loN) {
        traceNodePathAndRun(loN, colCorrectFxn, 'output', node);
      });
    }

    if (Array.isArray(node.inputOf) && node.inputOf.length > 0) {
      var laggingStepNodes = _underscore["default"].filter(node.inputOf, function (sN) {
        if (typeof sN.column === 'number' && sN.column <= node.column) {
          return true;
        }

        return false;
      });

      _underscore["default"].forEach(laggingStepNodes, function (lsN) {
        traceNodePathAndRun(lsN, colCorrectFxn, 'output', node);
      });
    }
  });

  return graphData;
}

function parseBasicIOAnalysisSteps(analysis_steps, workflowItem, parsingOptions) {
  function checkIfGlobal(io) {
    return io.meta && io.meta.global || _underscore["default"].any(io.source || io.target || [], function (tg) {
      return tg.name && !tg.step;
    }) || false;
  }

  return parseAnalysisSteps([_objectSpread({}, workflowItem, {
    inputs: _underscore["default"].filter(_underscore["default"].flatten(_underscore["default"].pluck(analysis_steps, 'inputs'), true), checkIfGlobal),
    outputs: _underscore["default"].filter(_underscore["default"].flatten(_underscore["default"].pluck(analysis_steps, 'outputs'), true), checkIfGlobal)
  })], parsingOptions);
}

function cleanEdgesByDeletedNodes(edges, deletedNodesObj) {
  return _underscore["default"].filter(edges, function (e) {
    return !(deletedNodesObj[e.source.id] === true || deletedNodesObj[e.target.id] === true);
  });
}

function cleanNodeReferencesByDeletedNodes(nodes, deletedNodesObj) {
  _underscore["default"].forEach(nodes, function (n) {
    if (Array.isArray(n.inputNodes) && n.inputNodes.length > 0) {
      n.inputNodes = _underscore["default"].filter(n.inputNodes, function (iN) {
        return deletedNodesObj[iN.id] !== true;
      });
    }

    if (Array.isArray(n.outputNodes) && n.outputNodes.length > 0) {
      n.outputNodes = _underscore["default"].filter(n.outputNodes, function (oN) {
        return deletedNodesObj[oN.id] !== true;
      });
    }
  });

  return nodes;
}

function filterOutParametersFromGraphData(graphData) {
  var deleted = {};

  var nodes = _underscore["default"].filter(graphData.nodes, function (n) {
    if (n.nodeType === 'input' && n.ioType && n.ioType === 'parameter') {
      deleted[n.id] = true;
      return false;
    }

    return true;
  });

  return {
    'nodes': cleanNodeReferencesByDeletedNodes(nodes, deleted),
    'edges': cleanEdgesByDeletedNodes(graphData.edges, deleted)
  };
}

function filterOutReferenceFilesFromGraphData(graphData) {
  var deleted = {};

  var nodes = _underscore["default"].filter(graphData.nodes, function (n) {
    if (n.ioType === 'reference file') {
      deleted[n.id] = true;
      return false;
    }

    return true;
  });

  return {
    'nodes': cleanNodeReferencesByDeletedNodes(nodes, deleted),
    'edges': cleanEdgesByDeletedNodes(graphData.edges, deleted)
  };
}

function filterOutIndirectFilesFromGraphData(graphData) {
  var deleted = {};

  var nodes = _underscore["default"].filter(graphData.nodes, function (n) {
    if (n.nodeType === 'input' || n.nodeType === 'output') {
      if (n && n.meta && n.meta.in_path === true) {
        return true;
      }

      deleted[n.id] = true;
      return false;
    }

    return true;
  });

  return {
    'nodes': cleanNodeReferencesByDeletedNodes(nodes, deleted),
    'edges': cleanEdgesByDeletedNodes(graphData.edges, deleted)
  };
}

function nodesPreSortFxn(nodes) {
  _underscore["default"].forEach(nodes, function (node) {
    if (node.nodeType === 'input' && node.meta && node.meta.global && !node.outputOf && node.column !== 0) {
      node.column = 0;
    }
  });

  return nodes;
}

function nodesInColumnSortFxn(node1, node2) {
  function isNodeFileReference(n) {
    return typeof n.ioType === 'string' && n.ioType === 'reference file';
  }

  function isNodeParameter(n) {
    return typeof n.ioType === 'string' && n.ioType === 'parameter';
  }

  function getNodeFromListForComparison(nodeList) {
    var averaged = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var highestColumn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var ownColumnFilter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    if (!Array.isArray(nodeList) || nodeList.length === 0) return null;
    if (nodeList.length === 1) return nodeList[0];

    if (averaged) {
      if (typeof ownColumnFilter === 'number' && ownColumnFilter > 1) {
        var nodeListFiltered = _underscore["default"].filter(nodeList, function (n) {
          return n.column === ownColumnFilter;
        });

        if (nodeListFiltered.length > 0) nodeList = nodeListFiltered;
      }

      return _underscore["default"].extend({}, nodeList[0], {
        'indexInColumn': _underscore["default"].reduce(nodeList, function (m, n) {
          return m + (typeof n.indexInColumn === 'number' ? n.indexInColumn : n.origIndexInColumn);
        }, 0) / nodeList.length
      });
    } else {
      var sortedList = _underscore["default"].sortBy(nodeList.slice(0), function (n) {
        return typeof n.indexInColumn === 'number' ? n.indexInColumn : n.origIndexInColumn;
      });

      sortedList = _underscore["default"].sortBy(sortedList, function (n) {
        return highestColumn ? -n.column : n.column;
      });
      return _underscore["default"].find(sortedList, function (n) {
        return typeof n.indexInColumn === 'number' || typeof n.origIndexInColumn === 'number';
      }) || sortedList[0] || null;
    }
  }

  function compareNodesBySameColumnIndex(n1, n2) {
    if (n1 && !n2) return -1;
    if (!n1 && n2) return 1;

    if (n1 && n2) {
      if (n1.column === n2.column) {
        var n1idx = typeof n1.indexInColumn === 'number' ? n1.indexInColumn : n1.origIndexInColumn;
        var n2idx = typeof n2.indexInColumn === 'number' ? n2.indexInColumn : n2.origIndexInColumn;
        if (n1idx < n2idx) return -1;
        if (n1idx > n2idx) return 1;
      }
    }

    return 0;
  }

  function compareNodeInputOf(n1, n2) {
    var n1InputOf = getNodeFromListForComparison(n1.nodeType === 'step' ? n1.outputNodes : n1.inputOf, true, false);
    var n2InputOf = getNodeFromListForComparison(n2.nodeType === 'step' ? n2.outputNodes : n2.inputOf, true, false);
    var ioResult = compareNodesBySameColumnIndex(n1InputOf, n2InputOf);
    if (ioResult !== 0) return ioResult;

    if (n1.name === n2.name) {
      return 0;
    }

    return n1.name < n2.name ? -1 : 1;
  }

  function compareNodeOutputOf(n1, n2) {
    var n1OutputOf = n1.nodeType === 'step' ? n1.inputNodes && getNodeFromListForComparison(n1.inputNodes) : n1.outputOf;
    var n2OutputOf = n2.nodeType === 'step' ? n2.inputNodes && getNodeFromListForComparison(n2.inputNodes) : n2.outputOf;

    if (n1OutputOf && typeof n1OutputOf.indexInColumn === 'number' && n2OutputOf && typeof n2OutputOf.indexInColumn === 'number') {
      if (n1OutputOf.column === n2OutputOf.column) {
        if (n1OutputOf.indexInColumn < n2OutputOf.indexInColumn) return -1;
        if (n1OutputOf.indexInColumn > n2OutputOf.indexInColumn) return 1;
      }
    }

    if (n1OutputOf && n1OutputOf.name && n2OutputOf && n2OutputOf.name) {
      if (n1OutputOf.name === n2OutputOf.name) {
        if (typeof n1.inputOf !== 'undefined' && typeof n2.inputOf === 'undefined') {
          return -3;
        } else if (typeof n1.inputOf === 'undefined' && typeof n2.inputOf !== 'undefined') {
          return 3;
        }

        if (n1.name < n2.name) return -1;
        if (n1.name > n2.name) return 1;
        return 0;
      }

      return n1OutputOf.name < n2OutputOf.name ? -3 : 3;
    }

    return 0;
  }

  function nonIOStepCompare() {
    return 0;
  }

  var ioResult;

  if (node1.nodeType === 'step' && node2.nodeType === 'step') {
    if (node1.inputNodes && !node2.inputNodes) return -1;
    if (!node1.inputNodes && node2.inputNodes) return 1;

    if (node1.inputNodes && node2.inputNodes) {
      ioResult = compareNodesBySameColumnIndex(getNodeFromListForComparison(node1.inputNodes, true, true, node1.column - 1), getNodeFromListForComparison(node2.inputNodes, true, true, node1.column - 1));
      if (ioResult !== 0) return ioResult;else {
        ioResult = compareNodesBySameColumnIndex(getNodeFromListForComparison(node1.inputNodes, false), getNodeFromListForComparison(node2.inputNodes, false));
        if (ioResult !== 0) return ioResult;
      }
    }

    return nonIOStepCompare(node1, node2);
  }

  if (node1.nodeType === 'output' && node2.nodeType === 'input') {
    return -1;
  } else if (node1.nodeType === 'input' && node2.nodeType === 'output') {
    return 1;
  }

  if (node1.nodeType === 'input-group' && node2.nodeType !== 'input-group') {
    return 1;
  } else if (node1.nodeType !== 'input-group' && node2.nodeType === 'input-group') {
    return -1;
  }

  if (node1.nodeType === node2.nodeType) {
    if (node1.nodeType === 'output') {
      ioResult = compareNodeOutputOf(node1, node2);
      return ioResult;
    }

    if (node1.nodeType === 'input') {
      if (isNodeParameter(node1) && isNodeParameter(node2)) {
        return compareNodeInputOf(node1, node2);
      } else if (isNodeParameter(node1)) return 5;else if (isNodeParameter(node2)) return -5;

      if (isNodeFileReference(node1)) {
        if (!isNodeFileReference(node2)) {
          return 7;
        }
      } else if (isNodeFileReference(node2)) {
        return -7;
      }

      ioResult = compareNodeInputOf(node1, node2);
      return ioResult;
    }
  }

  return 0;
}

function nodesInColumnPostSortFxn(nodesInColumn) {
  var groupNodes = _underscore["default"].filter(nodesInColumn, {
    'nodeType': 'input-group'
  });

  if (groupNodes.length > 0) {
    _underscore["default"].forEach(groupNodes, function (gN) {
      var relatedFileSource = _underscore["default"].find(gN._source, function (s) {
        return typeof s.grouped_by === 'undefined' && typeof s.name === 'string' && s.for_file;
      });

      var relatedFileNode = relatedFileSource && _underscore["default"].find(nodesInColumn, function (n) {
        if (n && n.meta && n.meta.run_data && n.meta.run_data.file && (n.meta.run_data.file['@id'] || n.meta.run_data.file) === (relatedFileSource.for_file || 'x')) {
          return true;
        }

        return false;
      });

      if (relatedFileNode) {
        var oldIdx = nodesInColumn.indexOf(gN);
        nodesInColumn.splice(oldIdx, 1);
        var afterThisIdx = nodesInColumn.indexOf(relatedFileNode);
        nodesInColumn.splice(afterThisIdx + 1, 0, gN);
      }
    });
  }

  return nodesInColumn;
}