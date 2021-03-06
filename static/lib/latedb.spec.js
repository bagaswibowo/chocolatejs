// Generated by CoffeeScript 1.12.6
(function() {
  var lateDB,
    hasProp = {}.hasOwnProperty;

  lateDB = require('chocolate/general/latedb');

  describe('lateDB', function() {
    var db, times;
    db = void 0;
    times = [];
    it('does not already exist ', function() {
      var exists, ready;
      ready = false;
      exists = void 0;
      lateDB.exists(function(e) {
        ready = true;
        return exists = e;
      });
      waitsFor((function() {
        return ready;
      }), 'LateDB to tell if it already exists', 1000);
      return runs(function() {
        return expect(exists).toBe(false);
      });
    });
    it('should create a default DB', function() {
      db = lateDB();
      expect(db).not.toBe(void 0);
      return expect(db.filename()).toBe('db.log');
    });
    it('should register some modules', function() {
      var Text, registered;
      Text = {
        upper: function(t) {
          return t.toUpperCase();
        },
        lower: function(t) {
          return t.toLowerCase();
        }
      };
      registered = db.register('Text', Text);
      expect(registered.upper).toBe(Text.upper);
      return expect(registered.lower).toBe(Text.lower);
    });
    it('should log some modifications', function() {
      var ref, ref1, ref2;
      db.update({
        'result': {
          data: 'done',
          op: function(data) {
            return (this.debug_log != null ? this.debug_log : this.debug_log = []).push(data);
          }
        }
      });
      expect((ref = db()) != null ? (ref1 = ref.result.debug_log) != null ? ref1.length : void 0 : void 0).toBe(1);
      return expect((ref2 = db()) != null ? ref2.result.debug_log[0] : void 0).toBe('done');
    });
    it('should flush the modifications to localStorage or to disk', function() {
      var flushed;
      flushed = false;
      runs(function() {
        return db.flushed(function() {
          return flushed = true;
        });
      });
      waitsFor((function() {
        return flushed;
      }), 'LateDB to be flushed', 1000);
      return runs(function() {
        return expect(flushed).toBe(true);
      });
    });
    it('should clear the DB', function() {
      var cleared;
      cleared = false;
      runs(function() {
        return db.clear(function() {
          return cleared = true;
        });
      });
      waitsFor((function() {
        return cleared === true;
      }), "database to be cleared", 500);
      return runs(function() {
        var is_empty;
        is_empty = (function() {
          var key, ref;
          ref = db() != null;
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue;
            false;
          }
          return true;
        })();
        return expect(is_empty).toBe(true);
      });
    });
    it('should reload the DB in the previous state', function() {
      var ref;
      db = lateDB();
      return expect((ref = db()) != null ? ref.result.debug_log[0] : void 0).toBe('done');
    });
    it('should increase the DB size with alternate update notation and using Text module service', function() {
      var count, update;
      count = 0;
      update = function() {
        count += 1;
        db('result', "done " + count + " time" + (count > 1 ? 's' : ''), function(data, modules) {
          return (this.debug_log != null ? this.debug_log : this.debug_log = []).push(modules.Text.lower(modules.Text.upper(data)));
        });
        times.push(Date.now());
        if (count < 5) {
          return setTimeout(update, 200);
        }
      };
      setTimeout(update, 200);
      waitsFor((function() {
        return count === 5;
      }), "database to have its size increased with count", 2000);
      return runs(function() {
        var ref;
        return expect((ref = db()) != null ? ref.result.debug_log[count] : void 0).toBe('done 5 times');
      });
    });
    it('should flush again the modifications to localStorage or to disk', function() {
      var flushed;
      flushed = false;
      runs(function() {
        return db.flushed(function() {
          return flushed = true;
        });
      });
      waitsFor((function() {
        return flushed;
      }), 'LateDB to be flushed again', 1000);
      return runs(function() {
        return expect(flushed).toBe(true);
      });
    });
    it('should revert the DB to some point in the past', function() {
      var done;
      done = false;
      runs(function() {
        return db.revert(times[times.length - 2], function() {
          return done = true;
        });
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to be reverted', 2000);
      return runs(function() {
        var count, ref, ref1;
        count = ((ref = db()) != null ? ref.result.debug_log.length : void 0) - 1;
        return expect((ref1 = db()) != null ? ref1.result.debug_log[count] : void 0).toBe('done 4 times');
      });
    });
    it('should compact at some point in the past', function() {
      var done;
      done = false;
      runs(function() {
        return db.compact(times[times.length - 3], {
          page_size: 10
        }, (function() {
          return done = true;
        }));
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to be compacted in the past', 2000);
      return runs(function() {
        var count, lines, ref, ref1;
        count = ((ref = db()) != null ? ref.result.debug_log.length : void 0) - 1;
        expect((ref1 = db()) != null ? ref1.result.debug_log[count] : void 0).toBe('done 4 times');
        if (typeof window === "undefined" || window === null) {
          lines = require('fs').readFileSync(db.pathname(), 'utf8').split('\n');
          expect(lines[0]).toBe("var _db={'result':{'debug_log':['done','done 1 time','done 2 times','done 3 times']}},_ops=[function (data) {");
          expect(lines[lines.length - 2]).toBe('_(1,0,"done 4 times");');
          return expect(lines[lines.length - 1]).toBe('');
        } else {
          lines = localStorage.getItem('LateDB-' + db.filename()).split('\n');
          expect(lines[0]).toBe('var _db = {"result":{"debug_log":["done","done 1 time","done 2 times","done 3 times"]}},');
          expect(lines[lines.length - 3]).toBe('_(1,0,"done 4 times");');
          return expect(lines[lines.length - 2]).toBe('');
        }
      });
    });
    it('should compact now', function() {
      var done;
      done = false;
      runs(function() {
        return db.compact({
          page_size: 10
        }, (function() {
          return done = true;
        }));
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to be compacted now', 2000);
      return runs(function() {
        var count, ref, ref1;
        count = ((ref = db()) != null ? ref.result.debug_log.length : void 0) - 1;
        return expect((ref1 = db()) != null ? ref1.result.debug_log[count] : void 0).toBe('done 4 times');
      });
    });
    it('should delete the DB', function() {
      var done;
      done = false;
      runs(function() {
        return db.clear({
          forget: true
        }, function() {
          return done = true;
        });
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to be deleted', 1000);
      return runs(function() {
        var ref;
        return expect((ref = db()) != null ? ref.constructor : void 0).toBe({}.constructor);
      });
    });
    it('should not exist anymore', function() {
      var done, exists;
      done = false;
      exists = void 0;
      lateDB.exists(function(e) {
        done = true;
        return exists = e;
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to tell if it still exists', 1000);
      return runs(function() {
        return expect(exists).toBe(false);
      });
    });
    it('could update a forgot DB by recreating it', function() {
      var flushed;
      db.update({
        'result': {
          data: "done again",
          op: function(data) {
            return (this.debug_log != null ? this.debug_log : this.debug_log = []).push(data);
          }
        }
      });
      flushed = false;
      runs(function() {
        return db.flushed(function() {
          return flushed = true;
        });
      });
      waitsFor((function() {
        return flushed;
      }), 'LateDB to be flushed again', 1000);
      return runs(function() {
        return expect(flushed).toBe(true);
      });
    });
    it('should log some more modifications with alternative syntax', function() {
      var ref, ref1, ref2, ref3, ref4, ref5;
      db.update({
        'result_2': 'done 2',
        'result_3': 'done 3'
      }, function(data) {
        return (this.debug_log != null ? this.debug_log : this.debug_log = []).push(data);
      });
      expect((ref = db()) != null ? (ref1 = ref.result_2.debug_log) != null ? ref1.length : void 0 : void 0).toBe(1);
      expect((ref2 = db()) != null ? ref2.result_2.debug_log[0] : void 0).toBe('done 2');
      expect((ref3 = db()) != null ? (ref4 = ref3.result_3.debug_log) != null ? ref4.length : void 0 : void 0).toBe(1);
      return expect((ref5 = db()) != null ? ref5.result_3.debug_log[0] : void 0).toBe('done 3');
    });
    it('should log some more modifications with a second alternative syntax', function() {
      var ref, ref1, ref2, ref3;
      db.update({
        name: 'doe',
        firstname: 'john'
      }, {
        'result_4': function(data) {
          var k, results, v;
          results = [];
          for (k in data) {
            v = data[k];
            results.push(this[k] = v.toString().toUpperCase());
          }
          return results;
        },
        'result_5': function(data) {
          var k, results, v;
          results = [];
          for (k in data) {
            v = data[k];
            results.push(this[k] = v.toString().substr(0, 2));
          }
          return results;
        }
      });
      expect((ref = db()) != null ? ref.result_4.name : void 0).toBe('DOE');
      expect((ref1 = db()) != null ? ref1.result_4.firstname : void 0).toBe('JOHN');
      expect((ref2 = db()) != null ? ref2.result_5.name : void 0).toBe('do');
      return expect((ref3 = db()) != null ? ref3.result_5.firstname : void 0).toBe('jo');
    });
    it('should delete the default DB again', function() {
      var done;
      done = false;
      runs(function() {
        return db.clear({
          forget: true
        }, function() {
          return done = true;
        });
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to be deleted again', 1000);
      return runs(function() {
        var ref;
        return expect((ref = db()) != null ? ref.constructor : void 0).toBe({}.constructor);
      });
    });
    it('should not exist anymore again', function() {
      var done, exists;
      done = false;
      exists = void 0;
      lateDB.exists(function(e) {
        done = true;
        return exists = e;
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to tell if it still exists again', 1000);
      return runs(function() {
        return expect(exists).toBe(false);
      });
    });
    it('has no table', function() {
      return expect(db.tables.count()).toBe(0);
    });
    it('can create a table', function() {
      var table;
      db.tables.create('categories/category');
      table = db("tables.categories");
      expect(table.entity_name).toBe('category');
      expect(table.alias).toBe('Category_');
      db.tables.create('colors');
      table = db("tables.colors");
      expect(table.entity_name).toBe('color');
      return expect(table.alias).toBe('Color_');
    });
    it('can insert some lines in a table', function() {
      db.tables.insert('colors', {
        id: 1,
        name: 'white'
      });
      db.tables.insert('colors', {
        id: 2,
        name: 'black'
      });
      db.tables.insert('colors', {
        id: 3,
        name: 'red'
      });
      expect(db('tables.colors').lines[1].id).toBe(1);
      return expect(db('tables.colors').lines[3].name).toBe('red');
    });
    it('can build an ìd', function() {
      var id;
      id = db.tables.id('colors');
      db.tables.insert('colors', {
        id: id,
        name: 'grey'
      });
      expect(id).toBe(4);
      expect(db('tables.colors').lines[id].id).toBe(4);
      return expect(db('tables.colors').lines[id].name).toBe('grey');
    });
    it('has created primary key indexes', function() {
      expect(db('tables.colors').index.id[1].id).toBe(1);
      return expect(db('tables.colors').index.id[3].name).toBe('red');
    });
    it('can create other tables', function() {
      var table;
      db.tables.create('brands');
      table = db("tables.brands");
      return expect(table.entity_name).toBe('brand');
    });
    it('can insert some lines in another table', function() {
      db.tables.insert('brands', {
        id: 1,
        name: 'Mercedes'
      });
      db.tables.insert('brands', {
        id: 2,
        name: 'BMW'
      });
      db.tables.insert('brands', {
        id: 3,
        name: 'Toyota'
      });
      db.tables.insert('brands', {
        id: 4,
        name: 'Honda'
      });
      expect(db('tables.brands').lines[2].id).toBe(2);
      return expect(db('tables.brands').lines[4].name).toBe('Honda');
    });
    it('can create last table', function() {
      var table;
      db.tables.create('cars');
      table = db("tables.cars");
      return expect(table.entity_name).toBe('car');
    });
    it('can insert some lines in last table', function() {
      db.tables.insert('cars', {
        id: 1,
        name: 'SLK 200',
        color_id: 1,
        brand_id: 1
      });
      db.tables.insert('cars', {
        id: 2,
        name: 'SL 600',
        color_id: 2,
        brand_id: 1
      });
      db.tables.insert('cars', {
        id: 3,
        name: 'BMW Série 2 Cabriolet',
        color_id: 2,
        brand_id: 2
      });
      db.tables.insert('cars', {
        id: 4,
        name: 'BMW Série 3 Berline',
        color_id: 3,
        brand_id: 2
      });
      db.tables.insert('cars', {
        id: 5,
        name: 'Toyota Prius',
        color_id: 1,
        brand_id: 3
      });
      db.tables.insert('cars', {
        id: 6,
        name: 'Toyota Aygo',
        color_id: 3,
        brand_id: 3
      });
      db.tables.insert('cars', {
        id: 7,
        name: 'Honda Accord',
        color_id: 2,
        brand_id: 4
      });
      db.tables.insert('cars', {
        id: 8,
        name: 'Honda Jazz',
        color_id: 1,
        brand_id: 4
      });
      expect(db('tables.cars').lines[4].id).toBe(4);
      expect(db('tables.cars').lines[5].name).toBe('Toyota Prius');
      return expect(db('tables.cars').lines[8].color_id).toBe(1);
    });
    it('can add and use a basic query that retrieve all colors', function() {
      var lines;
      db.tables.query.register({
        'Color_0': {}
      });
      lines = db.tables.query('Color');
      expect(lines.length).toBe(4);
      return expect(lines[2].name).toBe('red');
    });
    it('can add and use a simple query that retrieve cars by color_id', function() {
      var lines;
      db.tables.query.register({
        'Car_1_byColor': {
          filter: {
            keys: ['color'],
            clauses: ['color']
          }
        }
      });
      lines = db.tables.query('Car', [1], 'byColor');
      expect(lines.length).toBe(3);
      return expect(lines[1].name).toBe('Toyota Prius');
    });
    it('can add and use a simple query that retrieve cars by name', function() {
      var lines;
      db.tables.query.register({
        'Car_1_byName': {
          filter: {
            keys: ['name'],
            clauses: ['name']
          }
        }
      });
      lines = db.tables.query('Car', ['SL 600'], 'byName');
      expect(lines.length).toBe(1);
      return expect(lines[0].id).toBe(2);
    });
    it('can directly query and retrieve cars by brand_id', function() {
      var lines;
      lines = db.tables.query('Car', [2], {
        filter: {
          keys: ['brand'],
          clauses: ['brand']
        }
      });
      expect(lines.length).toBe(2);
      return expect(lines[1].name).toBe('BMW Série 3 Berline');
    });
    it('can directly query and sort cars', function() {
      var lines;
      lines = db.tables.query('Car', {
        sort: ['name']
      });
      expect(lines.length).toBe(8);
      return expect(lines[4].name).toBe('SL 600');
    });
    it('can try to query (with table\'s name) a non-existing table', function() {
      var lines;
      lines = db.tables.query('bikes');
      return expect(lines.length).toBe(0);
    });
    it('can try to query (with table\'s name) an existing but empty table', function() {
      var lines, table;
      db.tables.create('nulls');
      table = db("tables.nulls");
      expect(table.entity_name).toBe('null');
      lines = db.tables.query('nulls');
      return expect(lines.length).toBe(0);
    });
    it('can directly query (with table\'s name) and sort cars in reverse order', function() {
      var lines;
      lines = db.tables.query('cars', {
        sort: [
          {
            'name': -1
          }
        ]
      });
      expect(lines.length).toBe(8);
      return expect(lines[4].name).toBe('Honda Jazz');
    });
    it('can query and directly filter with a function', function() {
      var lines;
      lines = db.tables.query('cars', function(o) {
        return o.name === 'Honda Jazz';
      });
      expect(lines.length).toBe(1);
      return expect(lines[0].id).toBe(8);
    });
    it('can directly query and sort cars on multiple fields', function() {
      var lines;
      lines = db.tables.query({
        select: 'cars(*).brands(name)',
        sort: [
          'brands.name', {
            'name': -1
          }
        ]
      });
      expect(lines.length).toBe(8);
      return expect(lines[4].name).toBe('SLK 200');
    });
    it('can query and retrieve cars when brand_id is 2 and color_id isnt 1', function() {
      var lines;
      lines = db.tables.query('Car', [2], {
        filter: {
          keys: ['brand'],
          clauses: [
            'brand', {
              field: 'color_id',
              oper: 'isnt',
              value: 2
            }
          ]
        }
      });
      expect(lines.length).toBe(1);
      return expect(lines[0].name).toBe('BMW Série 3 Berline');
    });
    it('can query with function filter and retrieve cars when name does not start by "SL"', function() {
      var lines;
      lines = db.tables.query('Car', {
        filter: function(line, keys, tableName) {
          return line.name.indexOf('SL') !== 0;
        }
      });
      expect(lines.length).toBe(6);
      return expect(lines[0].name).toBe('BMW Série 2 Cabriolet');
    });
    it('can query and join tables to get color names used by cars', function() {
      var lines;
      lines = db.tables.query({
        select: 'cars.brands(*)',
        sort: ['name']
      });
      expect(lines.length).toBe(4);
      expect(lines[0].name).toBe('BMW');
      return expect(lines[3].name).toBe('Toyota');
    });
    it('can query and join tables to get brand names used by cars with a color_id 2', function() {
      var lines;
      lines = db.tables.query('Car', {
        select: 'colors.[cars].brands',
        filter: {
          clauses: [
            {
              field: 'colors.id',
              oper: 'is',
              value: 2
            }
          ]
        },
        map: {
          add: function(o, i) {
            o.id = i['cars.id'];
            o.name = i['cars.name'];
            return o.brand = i['brands.name'];
          }
        }
      });
      expect(lines.length).toBe(3);
      expect(lines[0].name).toBe('SL 600');
      return expect(lines[2].brand).toBe('Honda');
    });
    it('should flush the tables\‘ modifications to localStorage or to disk', function() {
      var flushed;
      flushed = false;
      runs(function() {
        return db.flushed(function() {
          return flushed = true;
        });
      });
      waitsFor((function() {
        return flushed;
      }), 'LateDB to be flushed', 1000);
      return runs(function() {
        return expect(flushed).toBe(true);
      });
    });
    it('should clear the DB with tables', function() {
      var cleared;
      cleared = false;
      runs(function() {
        return db.clear(function() {
          return cleared = true;
        });
      });
      waitsFor((function() {
        return cleared === true;
      }), "database to be cleared", 500);
      return runs(function() {
        var is_empty;
        is_empty = (function() {
          var key, ref;
          ref = db() != null;
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue;
            false;
          }
          return true;
        })();
        return expect(is_empty).toBe(true);
      });
    });
    it('should reload the DB with tables in the previous state', function() {
      var ref;
      db = lateDB();
      return expect((ref = db()) != null ? ref.tables.cars.name : void 0).toBe('cars');
    });
    it('can query again (after reload) and join tables to get color names used by cars', function() {
      var lines;
      lines = db.tables.query({
        select: 'cars.brands(*)',
        sort: ['name']
      });
      expect(lines.length).toBe(4);
      expect(lines[0].name).toBe('BMW');
      return expect(lines[3].name).toBe('Toyota');
    });
    it('can remove a line from a table', function() {
      expect(db('tables.cars').index.brand_id[4].length).toBe(2);
      expect(db('tables.brands').lines[4].cars_joins.length).toBe(2);
      expect(db('tables.brands').lines[4].cars_joins.index.color_id[2].length).toBe(1);
      db.tables["delete"]('cars', {
        id: 7
      });
      expect(db('tables.cars').lines[7]).toBe(void 0);
      expect(db('tables.cars').index.id[6].name).toBe('Toyota Aygo');
      expect(db('tables.cars').index.id[7]).toBe(void 0);
      expect(db('tables.cars').index.brand_id[4].length).toBe(1);
      expect(db('tables.cars').length).toBe(7);
      expect(db('tables.brands').lines[4].cars_joins.length).toBe(1);
      expect(db('tables.brands').lines[4].cars_joins.index.color_id[2].length).toBe(0);
      return expect(db('tables.brands').lines[4].cars_joins.index.color_id[2].list.items[7]).toBeUndefined();
    });
    it('can update a line in a table', function() {
      var lines;
      db.tables.update('brands', {
        id: 3,
        name: 'Toyota Motors'
      });
      expect(db('tables.brands').lines[3].name).toBe('Toyota Motors');
      lines = db.tables.query({
        select: 'cars.brands(*)',
        sort: ['name']
      });
      expect(lines.length).toBe(4);
      return expect(lines[3].name).toBe('Toyota Motors');
    });
    it('can not update an object in the world space before creating it', function() {
      db.world.update('users', "1ae2c4de", {
        country: 'spain'
      });
      return expect(db('users')).toBeNull();
    });
    it('can insert an object inside the world space', function() {
      db.world.insert('users', "1ae2c4de", {
        name: 'john doe',
        country: 'usa'
      });
      db.world.insert('users', "eb41aa9f", {
        name: 'henri dupont',
        country: 'france'
      });
      return expect(db('users')["1ae2c4de"].name).toBe('john doe');
    });
    it('can select an object by id from the world space', function() {
      var user;
      user = db.world.select("eb41aa9f");
      return expect(user.name).toBe('henri dupont');
    });
    it('can select all objects at path in the world space', function() {
      var id, names, user, users;
      users = db.world.select({
        path: 'users'
      });
      names = ((function() {
        var results;
        results = [];
        for (id in users) {
          user = users[id];
          results.push(user.name);
        }
        return results;
      })()).join(',');
      return expect(names).toBe('john doe,henri dupont');
    });
    it('can update an object in the world space', function() {
      var user;
      db.world.update('users', "1ae2c4de", {
        country: 'spain'
      });
      user = db.world.select("1ae2c4de");
      return expect(user.country).toBe('spain');
    });
    it('can remove an object from the world space', function() {
      var id, names, user, users;
      db.world["delete"]('users', "1ae2c4de");
      user = db.world.select("1ae2c4de");
      expect(user).toBeUndefined();
      users = db.world.select({
        path: 'users'
      });
      names = ((function() {
        var results;
        results = [];
        for (id in users) {
          user = users[id];
          results.push(user.name);
        }
        return results;
      })()).join(',');
      return expect(names).toBe('henri dupont');
    });
    it('should flush the world\‘s modifications to localStorage or to disk', function() {
      var flushed;
      flushed = false;
      runs(function() {
        return db.flushed(function() {
          return flushed = true;
        });
      });
      waitsFor((function() {
        return flushed;
      }), 'LateDB to be flushed', 1000);
      return runs(function() {
        return expect(flushed).toBe(true);
      });
    });
    it('should clear the DB with tables and world', function() {
      var cleared;
      cleared = false;
      runs(function() {
        return db.clear(function() {
          return cleared = true;
        });
      });
      waitsFor((function() {
        return cleared === true;
      }), "database to be cleared", 500);
      return runs(function() {
        var is_empty;
        is_empty = (function() {
          var key, ref;
          ref = db() != null;
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue;
            false;
          }
          return true;
        })();
        return expect(is_empty).toBe(true);
      });
    });
    it('should reload the DB with tables in the previous state', function() {
      var ref;
      db = lateDB();
      expect((ref = db()) != null ? ref.tables.cars.name : void 0).toBe('cars');
      expect(db('users')["1ae2c4de"]).toBe(void 0);
      return expect(db('users')["eb41aa9f"].name).toBe('henri dupont');
    });
    it('finally waits for the db to be flushed', function() {
      var flushed;
      flushed = false;
      runs(function() {
        return db.flushed(function() {
          return flushed = true;
        });
      });
      waitsFor((function() {
        return flushed;
      }), 'LateDB to be finaly flushed', 1000);
      return runs(function() {
        return expect(flushed).toBe(true);
      });
    });
    it('should finally delete the default DB again', function() {
      var done;
      done = false;
      runs(function() {
        return db.clear({
          forget: true
        }, function() {
          return done = true;
        });
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to be finally deleted', 1000);
      return runs(function() {
        var ref;
        return expect((ref = db()) != null ? ref.constructor : void 0).toBe({}.constructor);
      });
    });
    return it('should finally not exist anymore', function() {
      var done, exists;
      done = false;
      exists = void 0;
      lateDB.exists(function(e) {
        done = true;
        return exists = e;
      });
      waitsFor((function() {
        return done;
      }), 'LateDB to tell if it still finally exists', 1000);
      return runs(function() {
        return expect(exists).toBe(false);
      });
    });
  });

}).call(this);
