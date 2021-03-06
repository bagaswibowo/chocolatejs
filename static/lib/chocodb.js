// Generated by CoffeeScript 1.9.2
(function() {
  var _module, lateDB;

  lateDB = (function() {
    var _db, _exists, _filename, _flushed, _loading, _op_index, _ops, _path_index, _paths, _ready, log;
    _filename = 'db.log';
    _exists = false;
    _loading = false;
    _ready = [];
    _flushed = [];
    _db = {};
    _ops = [];
    _op_index = {};
    _paths = [];
    _path_index = {};
    log = (function() {
      var BufferStream, Fs, Path, _, _datadir, _pathname, _queue, clear, compact, exists, flush, flushed, forget, hash, init, load, parse, pathname, ready, require_db, revert, write;
      Fs = void 0;
      BufferStream = void 0;
      Path = void 0;
      _ = void 0;
      _queue = '';
      _pathname = null;
      _datadir = null;
      setTimeout((function() {
        return flush();
      }), 100);
      init = function(current, options) {
        var f, func_str, module, returns, var_str;
        if (current == null) {
          current = '';
        }
        if (options == null) {
          options = {};
        }
        module = options.module, var_str = options.var_str;
        if (module == null) {
          module = false;
        }
        if (typeof current === 'object' && (current._db != null)) {
          var_str = "var _db = " + (JSON.stringify(current._db)) + ",\n_o = [" + (((function() {
            var j, len, ref, results;
            ref = current._ops;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              f = ref[j];
              results.push(f.toString());
            }
            return results;
          })()).join(',')) + "],\n_oi = " + (JSON.stringify(current._op_index)) + ",\n_p = " + (JSON.stringify(current._paths)) + ",\n_pi = " + (JSON.stringify(current._path_index)) + ",\np, op;";
          current = '';
        } else {
          if (var_str == null) {
            var_str = "var _db = {},\n_o = [],\n_oi = {},\n_p = [],\n_pi = {},\np, op;";
          }
        }
        if (options.alias) {
          var_str += "_o = _ops;\n_oi = _op_index;\n_p = _paths;\n_pi = _path_index;";
        }
        if (options.rebuild) {
          var_str += (options.alias ? '\n' : '') + "if (_oi === null) {\n    var i, len;\n    _oi = {};\n    for (i = 0, len = _o.length; i < len; i++) {\n      _oi[_o[i].toString()] = i;\n    }\n    " + (options.alias ? "_op_index = _oi;" : "") + "\n};";
        }
        func_str = "var _ = function(oi, pi, data) {\n  var i, len, node, op, path, step, steps;\n  op = _o[oi];\n  path = _p[pi];\n  node = _db;\n  steps = path.split('.');\n  for (i = 0, len = steps.length; i < len; i++) {\n    step = steps[i];\n    if (node[step] == null) {\n      node[step] = {};\n    }\n    node = node[step];\n  }\n  op.call(node, data);\n};";
        returns = typeof window !== "undefined" && window !== null ? var_str + "\n" + func_str + "\n" + current : var_str + "\n" + func_str + "\nmodule.exports = {\n_db:_db,\n_ops:_o,\n_op_index:_oi,\n_paths:_p,\n_path_index:_pi\n};";
        if (module) {
          returns = "(function () {\n    " + returns + "\n    return {_db:_db,_ops:_o,_op_index:_oi,_paths:_p,_path_index:_pi}\n})()";
        }
        return returns + '\n';
      };
      pathname = function(filename) {
        if (_datadir == null) {
          _datadir = require('chocolate/server/document').datadir;
        }
        if (filename == null) {
          if (_pathname == null) {
            _pathname = _datadir + '/' + _filename;
          }
          return _pathname;
        } else {
          return _datadir + '/' + filename;
        }
      };
      require_db = function(filename) {
        var required;
        if (Path == null) {
          Path = require('path');
        }
        required = Path.resolve(pathname(filename != null ? filename : _filename));
        delete require.cache[required];
        return require(required);
      };
      load = function(initial_queue, callback) {
        var current, ref;
        if (_loading) {
          return;
        }
        _loading = true;
        _queue = '';
        if (typeof initial_queue === 'function') {
          callback = initial_queue;
          initial_queue = "";
        }
        if (initial_queue == null) {
          initial_queue = '';
        }
        if (typeof window !== "undefined" && window !== null) {
          current = localStorage.getItem('LateDB');
          if ((current != null) && current !== "") {
            ref = eval(init(current, {
              module: true
            })), _db = ref._db, _ops = ref._ops, _op_index = ref._op_index, _paths = ref._paths, _path_index = ref._path_index;
          }
          return setTimeout((function() {
            var f, j, len;
            _queue = initial_queue;
            _loading = false;
            _exists = true;
            for (j = 0, len = _ready.length; j < len; j++) {
              f = _ready[j];
              f();
            }
            return typeof callback === "function" ? callback() : void 0;
          }), 10);
        } else {
          if (Fs == null) {
            Fs = require('fs');
          }
          return Fs.exists(pathname(), function(exists) {
            var f, j, len, ref1;
            if (!exists) {
              _queue = init();
            } else {
              ref1 = require_db(), _db = ref1._db, _ops = ref1._ops, _op_index = ref1._op_index, _paths = ref1._paths, _path_index = ref1._path_index;
            }
            _queue += (_queue !== '' ? '\n' : '') + initial_queue;
            _loading = false;
            _exists = true;
            for (j = 0, len = _ready.length; j < len; j++) {
              f = _ready[j];
              f();
            }
            return typeof callback === "function" ? callback() : void 0;
          });
        }
      };
      write = function(op_index, path_index, data) {
        var op, path;
        switch (arguments.length) {
          case 0:
            return _queue += "// " + (Date.now().valueOf()) + "\n";
          case 2:
            if (typeof path_index === 'string') {
              path = path_index;
              return _queue += "p='" + path + "';\n_pi[p]=_p.push(p)-1;\n";
            } else {
              op = path_index;
              return _queue += "op=" + (op.toString().replace(/^\/\/.*(\n)*/mg, '')) + ";\n_oi[op.toString()]=_o.push(op)-1;\n";
            }
            break;
          default:
            return _queue += "_(" + op_index + "," + path_index + "," + (JSON.stringify(data)) + ");\n";
        }
      };
      flush = function() {
        var do_flush;
        if (_queue.length > 0) {
          do_flush = function() {
            var current;
            if (typeof window !== "undefined" && window !== null) {
              current = localStorage.getItem('LateDB');
              localStorage.setItem('LateDB', (current != null ? current : "") + _queue);
              setTimeout((function() {
                var f, j, len, results;
                results = [];
                for (j = 0, len = _flushed.length; j < len; j++) {
                  f = _flushed[j];
                  results.push(f());
                }
                return results;
              }), 10);
              setTimeout((function() {
                return flush();
              }), 100);
            } else {
              Fs.appendFile(pathname(), _queue, function() {
                var f, j, len;
                for (j = 0, len = _flushed.length; j < len; j++) {
                  f = _flushed[j];
                  f();
                }
                return setTimeout((function() {
                  return flush();
                }), 100);
              });
            }
            return _queue = "";
          };
          if (!_exists) {
            return load(_queue, do_flush);
          } else {
            return do_flush();
          }
        } else {
          return setTimeout((function() {
            return flush();
          }), 100);
        }
      };
      forget = function(callback) {
        _queue = "";
        if (typeof window !== "undefined" && window !== null) {
          localStorage.removeItem('LateDB');
          _exists = false;
          if (typeof callback === "function") {
            callback();
          }
        } else {
          Fs.unlink(pathname(), function() {
            _exists = false;
            return typeof callback === "function" ? callback() : void 0;
          });
        }
      };
      exists = function(callback) {
        if (typeof window !== "undefined" && window !== null) {
          setTimeout((function() {
            return typeof callback === "function" ? callback(localStorage.getItem('LateDB') != null) : void 0;
          }), 10);
        } else {
          if (Fs == null) {
            Fs = require('fs');
          }
          Fs.exists(pathname(), function(exists) {
            return typeof callback === "function" ? callback(exists) : void 0;
          });
        }
      };
      clear = function(options, callback) {
        if (typeof options === 'function') {
          callback = options;
          options = null;
        }
        _db = {};
        _ops = [];
        _op_index = {};
        _paths = [];
        _path_index = {};
        if (options != null ? options.forget : void 0) {
          forget(callback);
        } else {
          setTimeout((function() {
            return typeof callback === "function" ? callback() : void 0;
          }), 10);
        }
      };
      hash = function(s) {
        var c, h, i;
        h = 0;
        if (s.length === 0) {
          return h;
        }
        i = 0;
        while (i < s.length) {
          c = s.charCodeAt(i);
          h = (h << 5) - h + c;
          h |= 0;
          i++;
        }
        return h;
      };
      parse = function(context, time_limit, only_after) {
        var items, time;
        if (only_after == null) {
          only_after = false;
        }
        if (context.after == null) {
          context.after = false;
        }
        if (context.line[0] === '/' && context.line[1] === '/') {
          items = context.line.split(' ');
          time = parseInt(items[1]);
          if ((time_limit != null) && time > time_limit) {
            context.after = true;
          }
        }
        if ((!only_after && context.after) || (only_after && !context.after)) {
          return false;
        }
        if (context.log != null) {
          context.log += context.line + '\n';
        }
        return true;
      };
      revert = function(time, callback) {
        var buffer, bytes, context, current, i, j, len, line, lines, readStream;
        if (typeof window !== "undefined" && window !== null) {
          context = {
            log: ''
          };
          current = localStorage.getItem('LateDB');
          lines = current.split('\n');
          for (i = j = 0, len = lines.length; j < len; i = ++j) {
            line = lines[i];
            context.line = line;
            context.index = i;
            if (!parse(context, time)) {
              break;
            }
          }
          localStorage.setItem('LateDB', context.log);
          load(function() {
            return typeof callback === "function" ? callback() : void 0;
          });
        } else {
          context = {};
          if (BufferStream == null) {
            BufferStream = require('bufferstream');
          }
          buffer = new BufferStream({
            size: 'flexible',
            split: '\n'
          });
          i = 0;
          bytes = 0;
          buffer.on('data', function(chunk) {
            context.line = chunk.toString();
            context.index = i++;
            if (!parse(context, time)) {
              return readStream.unpipe();
            } else {
              return bytes += 1 + Buffer.byteLength(context.line, 'utf8');
            }
          });
          buffer.on('unpipe', function() {
            return clear(function() {
              return Fs.truncate(pathname(), bytes, function() {
                return load(function() {
                  return typeof callback === "function" ? callback() : void 0;
                });
              });
            });
          });
          readStream = Fs.createReadStream(pathname());
          readStream.on('open', function() {
            return readStream.pipe(buffer);
          });
        }
      };
      compact = function(time, options, callback) {
        var context, copy, current, i, j, len, line, lines, now, only_after, page_size, ref, temp_filename;
        if (typeof options === 'function') {
          callback = options;
          options = time;
          time = null;
        }
        if (typeof time === 'function') {
          callback = time;
          options = null;
          time = null;
        }
        if (typeof window !== "undefined" && window !== null) {
          context = {
            log: ''
          };
          current = localStorage.getItem('LateDB');
          lines = current.split('\n');
          context.found = false;
          only_after = false;
          for (i = j = 0, len = lines.length; j < len; i = ++j) {
            line = lines[i];
            context.line = line;
            context.index = i;
            if (!parse(context, time, only_after)) {
              if (!context.found) {
                context.found = true;
                context.log = init(eval(init(context.log, {
                  module: true
                })));
                only_after = true;
                parse(context, time, only_after);
              }
            }
          }
          localStorage.setItem('LateDB', context.log);
          load(function() {
            return typeof callback === "function" ? callback() : void 0;
          });
        } else {
          page_size = (ref = options != null ? options.page_size : void 0) != null ? ref : 128 * 1024;
          temp_filename = [(now = new Date()).getFullYear(), (now.getMonth() + 1 < 10 ? '0' : '') + (now.getMonth() + 1), (now.getDate() < 10 ? '0' : '') + now.getDate(), '-', process.pid, '-', (Math.random() * 0x100000000 + 1).toString(36)].join('');
          copy = function(context, options, callback) {
            var buffer, readStream;
            if (typeof options === 'function') {
              callback = options;
              options = null;
            }
            if (options == null) {
              options = {
                append: false
              };
            }
            if (options.append && (time == null)) {
              setTimeout((function() {
                return callback();
              }), 10);
              return;
            }
            if (BufferStream == null) {
              BufferStream = require('bufferstream');
            }
            buffer = new BufferStream({
              size: 'flexible',
              split: '\n'
            });
            i = 0;
            buffer.on('data', function(chunk) {
              context.line = chunk.toString();
              context.index = i++;
              if (!parse(context, time, options.append)) {
                if (!options.append) {
                  return readStream.unpipe();
                }
              } else {
                if (context.log.length > page_size && context.flushable) {
                  context.flushable = false;
                  Fs.appendFile(pathname(temp_filename), context.log.substr(), function() {
                    return context.flushable = true;
                  });
                  return context.log = '';
                }
              }
            });
            buffer.on('unpipe', function() {
              var wait_io;
              wait_io = function() {
                if (context.flushable) {
                  return Fs.appendFile(pathname(temp_filename), context.log, function() {
                    return callback();
                  });
                } else {
                  return setTimeout(wait_io, 10);
                }
              };
              return wait_io();
            });
            readStream = Fs.createReadStream(pathname());
            return readStream.on('open', function() {
              return readStream.pipe(buffer);
            });
          };
          if (_ == null) {
            _ = require('./chocodash');
          }
          context = {
            log: '',
            flushable: true
          };
          copy(context, function() {
            return clear(function() {
              var compacting_db;
              compacting_db = require_db(temp_filename);
              return Fs.unlink(pathname(temp_filename), function() {
                var wait_io;
                context = {
                  log: '',
                  flushable: true
                };
                write = function(chunk, index) {
                  var ref1;
                  context.log += (ref1 = (index > 0 ? ',' : '') + chunk) != null ? ref1 : '';
                  if (context.flushable && (context.log.length > page_size || (chunk == null))) {
                    context.flushable = false;
                    Fs.appendFile(pathname(temp_filename), context.log.substr(), function() {
                      return context.flushable = true;
                    });
                    context.log = "";
                  }
                };
                compacting_db._op_index = null;
                _.stringify(compacting_db, {
                  write: write,
                  strict: true,
                  variable: true
                });
                wait_io = function() {
                  if (context.flushable) {
                    context.log += (init('', {
                      var_str: '',
                      alias: true,
                      rebuild: true
                    })) + "\n";
                    return Fs.appendFile(pathname(temp_filename), context.log, function() {
                      context = {
                        log: '',
                        flushable: true
                      };
                      return copy(context, {
                        append: true
                      }, function() {
                        return Fs.unlink(pathname(), function() {
                          return Fs.rename(pathname(temp_filename), pathname(), function() {
                            return load(function() {
                              return typeof callback === "function" ? callback() : void 0;
                            });
                          });
                        });
                      });
                    });
                  } else {
                    return setTimeout(wait_io, 10);
                  }
                };
                return wait_io();
              });
            });
          });
        }
      };
      ready = function(callback) {
        return _ready.push(callback);
      };
      flushed = function(callback) {
        if (_queue.length > 0) {
          return _flushed.push(callback);
        } else {
          return setTimeout((function() {
            return typeof callback === "function" ? callback() : void 0;
          }), 10);
        }
      };
      return {
        exists: exists,
        ready: ready,
        load: load,
        write: write,
        flushed: flushed,
        clear: clear,
        hash: hash,
        revert: revert,
        compact: compact,
        pathname: pathname
      };
    })();
    lateDB = function(name) {
      var db;
      if (name != null) {
        _filename = name;
      }
      db = function(path) {
        var j, len, node, step, steps;
        if (path == null) {
          return _db;
        }
        node = _db;
        steps = path.split('.');
        for (j = 0, len = steps.length; j < len; j++) {
          step = steps[j];
          if (!(node != null)) {
            continue;
          }
          if (node[step] == null) {
            node[step] = {};
          }
          node = node[step];
        }
        return node;
      };
      db.ready = function(callback) {
        return log.ready.apply(log, arguments);
      };
      db.flushed = function(callback) {
        return log.flushed.apply(log, arguments);
      };
      db.revert = function(time, callback) {
        return log.revert.apply(log, arguments);
      };
      db.compact = function(time, callback) {
        return log.compact.apply(log, arguments);
      };
      db.clear = function(options, callback) {
        return log.clear.apply(log, arguments);
      };
      db.pathname = function(options, callback) {
        return log.pathname.apply(log, arguments);
      };
      db.filename = function() {
        return _filename;
      };
      db.update = function(updates) {
        var data, op, op_hash, op_index, path, path_index, ref;
        log.write();
        for (path in updates) {
          ref = updates[path], data = ref.data, op = ref.op;
          op_hash = log.hash(op.toString());
          op_index = _op_index[op_hash];
          if (op_index == null) {
            op_index = _op_index[op_hash] = -1 + _ops.push(op);
            log.write(op_index, op);
          }
          path_index = _path_index[path];
          if (path_index == null) {
            path_index = _path_index[path] = -1 + _paths.push(path);
            log.write(op_index, path);
          }
          op.call(db(path), data);
          log.write(op_index, path_index, data);
        }
      };
      log.load();
      return db;
    };
    lateDB.exists = function(callback) {
      return log.exists(callback);
    };
    return lateDB;
  })();

  _module = typeof window !== "undefined" && window !== null ? window : module;

  _module[_module.exports != null ? "exports" : "Chocokup"] = lateDB;

}).call(this);
