'use strict';

var expect = require('chai').expect,
  objectPath = require('./index.js')
  ;

function getTestObj() {
  return {
    a: 'b',
    b: {
      c: [],
      d: ['a', 'b'],
      e: [{}, { f: 'g' }],
      f: 'i'
    }
  };
}


describe('objectPath', function () {

  describe('get', function () {
    it('should return the value using unicode key', function () {
      var obj = {
        '15\u00f8C': {
          '3\u0111': 1
        }
      };
      expect(objectPath.get(obj, '15\u00f8C.3\u0111')).to.be.equal(1);
      expect(objectPath.get(obj, ['15\u00f8C', '3\u0111'])).to.be.equal(1);
    });

    it('should return the value using dot in key', function () {
      var obj = {
        'a.b': {
          'looks.like': 1
        }
      };
      expect(objectPath.get(obj, 'a.b.looks.like')).to.be.equal(void 0);
      expect(objectPath.get(obj, ['a.b', 'looks.like'])).to.be.equal(1);
    });

    it('should return the value under shallow object', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj, 'a')).to.be.equal('b');
      expect(objectPath.get(obj, ['a'])).to.be.equal('b');
    });

    if (typeof Symbol === 'function') {
      it('should work with Symbol path', function () {
        var obj = getTestObj();
        var symbol = Symbol();
        expect(objectPath.set(obj, symbol, 'a')).to.be.equal(void 0);
        expect(objectPath.get(obj, symbol)).to.be.equal('a');
        expect(objectPath.get(obj, [symbol])).to.be.equal('a');
      });
    }


    it('should work with number path', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj.b.d, 0)).to.be.equal('a');
      expect(objectPath.get(obj.b, 0)).to.be.equal(void 0);
    });

    it('should return the value under deep object', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj, 'b.f')).to.be.equal('i');
      expect(objectPath.get(obj, ['b', 'f'])).to.be.equal('i');
    });

    it('should return the value under array', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj, 'b.d.0')).to.be.equal('a');
      expect(objectPath.get(obj, ['b', 'd', 0])).to.be.equal('a');
    });

    it('should return the value under array deep', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj, 'b.e.1.f')).to.be.equal('g');
      expect(objectPath.get(obj, ['b', 'e', 1, 'f'])).to.be.equal('g');
    });

    it('should return undefined for missing values under object', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj, 'a.b')).to.not.exist;
      expect(objectPath.get(obj, ['a', 'b'])).to.not.exist;
    });

    it('should return undefined for missing values under array', function () {
      var obj = getTestObj();
      expect(objectPath.get(obj, 'b.d.5')).to.not.exist;
      expect(objectPath.get(obj, ['b', 'd', '5'])).to.not.exist;
    });

    it('should return the value under integer-like key', function () {
      var obj = { '1a': 'foo' };
      expect(objectPath.get(obj, '1a')).to.be.equal('foo');
      expect(objectPath.get(obj, ['1a'])).to.be.equal('foo');
    });

    it('should return the default value when the key doesnt exist', function () {
      var obj = { '1a': 'foo' };
      expect(objectPath.get(obj, '1b', null)).to.be.equal(null);
      expect(objectPath.get(obj, ['1b'], null)).to.be.equal(null);
    });

    it('should throw when path is empty', function () {
      var obj = { '1a': 'foo' };
      expect(function(){
        objectPath.get(obj, '', null)
      }).to.throw();
      expect(function(){
        objectPath.get(obj, [])
      }).to.throw();
      expect(function(){
        objectPath.get({}, ['1'])
      }).to.throw();
    });

    it('should throw when obj is empty', function () {
      expect(function(){
        objectPath.get({}, 'path', null)
      }).to.throw();
    });

    it('should skip non own properties with isEmpty', function () {
      var Base = function (enabled) { };
      Base.prototype = {
        one: {
          two: true
        }
      };
      var Extended = function () {
        Base.call(this, true);
      };
      Extended.prototype = Object.create(Base.prototype);

      var extended = new Extended();

      expect(objectPath.get(extended, ['one', 'two'], undefined, true)).to.be.equal(undefined);
      extended.enabled = true;

      expect(objectPath.get(extended, 'enabled')).to.be.equal(true);
    });

    it('should not skip non own properties if ownPropertiesOnly set to false', function() {
      var Base = function (enabled) { };
      Base.prototype = {
        one: {
          two: true
        }
      };
      var Extended = function () {
        Base.call(this, true);
      };
      Extended.prototype = Object.create(Base.prototype);

      var extended = new Extended();
      extended.enabled = true;

      expect(objectPath.get(extended, ['one', 'two'], void 0, false)).to.be.equal(true);

      expect(objectPath.get(extended, 'enabled', void 0, false)).to.be.equal(true);
    });
  });


  describe('set', function () {
    it('should set the value using unicode key', function () {
      var obj = {
        '15\u00f8C': {
          '3\u0111': 1
        }
      };
      objectPath.set(obj, '15\u00f8C.3\u0111', 2);
      expect(objectPath.get(obj, '15\u00f8C.3\u0111')).to.be.equal(2);
      objectPath.set(obj, '15\u00f8C.3\u0111', 3);
      expect(objectPath.get(obj, ['15\u00f8C', '3\u0111'])).to.be.equal(3);
    });

    it('should set the value using dot in key', function () {
      var obj = {
        'a.b': {
          'looks.like': 1
        }
      };
      objectPath.set(obj, ['a.b', 'looks.like'], 2);
      expect(objectPath.get(obj, ['a.b', 'looks.like'])).to.be.equal(2);
    });

    it('should set value under shallow object', function () {
      var obj = getTestObj();
      objectPath.set(obj, 'c', { m: 'o' });
      expect(obj).to.have.deep.property('c.m', 'o');
      obj = getTestObj();
      objectPath.set(obj, ['c'], { m: 'o' });
      expect(obj).to.have.deep.property('c.m', 'o');
    });

    if (typeof Symbol === 'function') {
      it('should set using Symbol', function () {
        var obj = getTestObj();
        var symbol = Symbol();
        objectPath.set(obj, symbol, { m: 'o' });
        expect(obj[symbol]['m']).to.equal('o');
      });
    }

    it('should set value using number path', function () {
      var obj = getTestObj();
      objectPath.set(obj.b.d, 0, 'o');
      expect(obj).to.have.deep.property('b.d.0', 'o');
    });

    it('should set value under deep object', function () {
      var obj = getTestObj();
      objectPath.set(obj, 'b.c', 'o');
      expect(obj).to.have.deep.property('b.c', 'o');
      obj = getTestObj();
      objectPath.set(obj, ['b', 'c'], 'o');
      expect(obj).to.have.deep.property('b.c', 'o');
    });

    it('should set value under array', function () {
      var obj = getTestObj();
      objectPath.set(obj, 'b.e.1.g', 'f');
      expect(obj).to.have.deep.property('b.e.1.g', 'f');
      obj = getTestObj();
      objectPath.set(obj, ['b', 'e', 1, 'g'], 'f');
      expect(obj).to.have.deep.property('b.e.1.g', 'f');
    });

    it('should create intermediate objects', function () {
      var obj = getTestObj();
      objectPath.set(obj, 'c.d.e.f', 'l');
      expect(obj).to.have.deep.property('c.d.e.f', 'l');
      obj = getTestObj();
      objectPath.set(obj, ['c', 'd', 'e', 'f'], 'l');
      expect(obj).to.have.deep.property('c.d.e.f', 'l');
    });

    it('should create intermediate arrays', function () {
      var obj = getTestObj();
      objectPath.set(obj, 'c.0.1.m', 'l');
      expect(obj.c).to.be.an('array');
      expect(obj.c[0]).to.be.an('array');
      expect(obj).to.have.deep.property('c.0.1.m', 'l');
      obj = getTestObj();
      objectPath.set(obj, ['c', '0', 1, 'm'], 'l');
      expect(obj.c).to.be.an('object');
      expect(obj.c[0]).to.be.an('array');
      expect(obj).to.have.deep.property('c.0.1.m', 'l');
    });

    it('should set value under integer-like key', function () {
      var obj = getTestObj();
      objectPath.set(obj, '1a', 'foo');
      expect(obj).to.have.deep.property('1a', 'foo');
      obj = getTestObj();
      objectPath.set(obj, ['1a'], 'foo');
      expect(obj).to.have.deep.property('1a', 'foo');
    });

    it('should set value under empty array', function () {
      var obj = [];
      objectPath.set(obj, [0], 'foo');
      expect(obj[0]).to.be.equal('foo');
      obj = [];
      objectPath.set(obj, '0', 'foo');
      expect(obj[0]).to.be.equal('foo');
    });
  });


  describe('push', function () {
    it('should push value to existing array using unicode key', function () {
      var obj = getTestObj();
      objectPath.push(obj, 'b.\u1290c', ['l']);
      expect(obj).to.have.deep.property('b.\u1290c.0', 'l');
      objectPath.push(obj, ['b', '\u1290c'], ['l']);
      expect(obj).to.have.deep.property('b.\u1290c.1', 'l');
    });

    it('should push value to existing array using dot key', function () {
      var obj = getTestObj();
      objectPath.push(obj, ['b', 'z.d'], ['l']);
      expect(objectPath.get(obj, ['b', 'z.d', 0])).to.be.equal('l');
    });

    it('should push value to existing array', function () {
      var obj = getTestObj();
      objectPath.push(obj, 'b.c', ['l']);
      expect(obj).to.have.deep.property('b.c.0', 'l');
      obj = getTestObj();
      objectPath.push(obj, ['b', 'c'], ['l']);
      expect(obj).to.have.deep.property('b.c.0', 'l');
    });

    it('should push value to new array', function () {
      var obj = getTestObj();
      objectPath.push(obj, 'b.h', ['l']);
      expect(obj).to.have.deep.property('b.h.0', 'l');
      obj = getTestObj();
      objectPath.push(obj, ['b', 'h'], ['l']);
      expect(obj).to.have.deep.property('b.h.0', 'l');
    });

    it('should push value to existing array using number path', function () {
      var obj = getTestObj();
      objectPath.push(obj.b.e, 0, ['l']);
      expect(obj).to.have.deep.property('b.e.0.0', 'l');
    });

  });


  describe('ensureExists', function () {
    it('should create the path if it does not exists', function () {
      var obj = getTestObj();
      var oldVal = objectPath.ensureExists(obj, 'b.g.1.l', 'test');
      expect(oldVal).to.not.exist;
      expect(obj).to.have.deep.property('b.g.1.l', 'test');
      oldVal = objectPath.ensureExists(obj, 'b.g.1.l', 'test1');
      expect(oldVal).to.be.equal('test');
      expect(obj).to.have.deep.property('b.g.1.l', 'test');
      oldVal = objectPath.ensureExists(obj, 'b.\u8210', 'ok');
      expect(oldVal).to.not.exist;
      expect(obj).to.have.deep.property('b.\u8210', 'ok');
      oldVal = objectPath.ensureExists(obj, ['b', 'dot.dot'], 'ok');
      expect(oldVal).to.not.exist;
      expect(objectPath.get(obj, ['b', 'dot.dot'])).to.be.equal('ok');
    });


    it('should throw if path is empty', function () {
      var obj = getTestObj();
      expect(function(){
        objectPath.ensureExists(obj, [], 'test');
      }).to.throw();
    });

    it('Issue #26', function () {
      var any = {};
      objectPath.ensureExists(any, ['1', '1'], {});
      expect(any).to.be.an('object');
      expect(any[1]).to.be.an('object');
      expect(any[1][1]).to.be.an('object');
    });
  });

  describe('coalesce', function () {
    it('should return the first non-undefined value', function () {
      var obj = {
        should: { have: 'prop' }
      };

      expect(objectPath.coalesce(obj, [
        'doesnt.exist',
        ['might', 'not', 'exist'],
        'should.have'
      ])).to.equal('prop');
    });

    it('should work with falsy values (null, 0, \'\', false)', function () {
      var obj = {
        is: {
          false: false,
          null: null,
          empty: '',
          zero: 0
        }
      };

      expect(objectPath.coalesce(obj, [
        'doesnt.exist',
        'is.zero'
      ])).to.equal(0);

      expect(objectPath.coalesce(obj, [
        'doesnt.exist',
        'is.false'
      ])).to.equal(false);

      expect(objectPath.coalesce(obj, [
        'doesnt.exist',
        'is.null'
      ])).to.equal(null);

      expect(objectPath.coalesce(obj, [
        'doesnt.exist',
        'is.empty'
      ])).to.equal('');
    });

    it('returns defaultValue if no paths found', function () {
      var obj = {
        doesnt: 'matter'
      };

      expect(objectPath.coalesce(obj, ['some.inexistant', 'path', ['on', 'object']], 'false')).to.equal('false');
    });

    it('works with unicode and dot keys', function () {
      var obj = {
        '\u7591': true,
        'dot.dot': false
      };

      expect(objectPath.coalesce(obj, ['1', '\u7591', 'a.b'])).to.equal(true);
      expect(objectPath.coalesce(obj, ['1', ['dot.dot'], '\u7591'])).to.equal(false);
    });
  });

  describe('empty', function () {
    it('should throw in case of empty path or object', function () {
      var obj = {};

      expect(function(){
        objectPath.empty(obj, 'path');
      }).to.throw();

      expect(function(){
        objectPath.empty(obj, '');
      }).to.throw();

      obj.path = true;

      expect(function(){
        objectPath.empty(obj, 'inexistant')
      }).to.not.throw();
    });

    if (typeof Symbol === 'function') {
      it('should work with symbol paths', function(){
        var obj = {}, symbol = Symbol();
        obj[symbol] = { one: 1, two: 2 };
        objectPath.empty(obj, symbol);
        expect(obj[symbol]).to.deep.equal({});
      });

      it('should work with symbols in underlaying paths', function(){
        var obj = {}, symbol = Symbol(), three = Symbol();
        obj[symbol] = { one: 1, two: 2 };
        obj[symbol][three] = 3;
        objectPath.empty(obj, symbol);
        expect(obj[symbol]).to.deep.equal({});
        expect(obj[symbol][three]).to.equal(void 0);
      });
    }

    it('should deal with non-own properties', function(){
      function B(){
      }
      B.prototype.g = 'ok';
      B.prototype.o = { ok: 1 };

      var b = new B();

      objectPath.empty(b, 'o', true, false);

    });

    it('should empty each path according to their types', function () {
      function Instance() {
        this.notOwn = true;
      }

      Instance.prototype.test = function () { };
      Instance.prototype.arr = [];

      var
        obj = {
          string: 'some string',
          array: ['some', 'array', [1, 2, 3]],
          number: 21,
          boolean: true,
          object: {
            some: 'property',
            sub: {
              'property': true
            }
          },
          instance: new Instance()
        };

      obj['function'] = function () { };

      objectPath.empty(obj, ['array', '2']);
      expect(obj.array[2]).to.deep.equal([]);

      objectPath.empty(obj, 'object.sub');
      expect(obj.object.sub).to.deep.equal({});

      objectPath.empty(obj, 'instance.test');
      expect(obj.instance.test).to.equal(null);
      expect(Instance.prototype.test).to.be.a('function');

      objectPath.empty(obj, 'string');
      objectPath.empty(obj, 'number');
      objectPath.empty(obj, 'boolean');
      objectPath.empty(obj, 'function');
      objectPath.empty(obj, 'array');
      objectPath.empty(obj, 'object');
      objectPath.empty(obj, 'instance');

      expect(obj.string).to.equal('');
      expect(obj.array).to.deep.equal([]);
      expect(obj.number).to.equal(0);
      expect(obj.boolean).to.equal(false);
      expect(obj.object).to.deep.equal({});
      expect(obj.instance.notOwn).to.be.an('undefined');
      expect(obj.instance.arr).to.be.an('array');
      expect(obj['function']).to.equal(null);
    });
  });

  describe('del', function () {
    it('should throw on empty object', function () {
      expect(function(){
        objectPath.del({}, 'a');
      }).to.throw();
    });

    it('should work with number path', function () {
      var obj = getTestObj();
      objectPath.del(obj.b.d, 1);
      expect(obj.b.d).to.deep.equal(['a']);
    });

    if (typeof Symbol === 'function') {
      it('should work with symbol path', function () {
        var obj = getTestObj();
        obj[Symbol.for('del')] = 'del';
        objectPath.del(obj, Symbol.for('del'));
        expect(obj[Symbol.for('del')]).to.equal(void 0);
      });
    }

    it('should delete deep paths', function () {
      var obj = getTestObj();

      objectPath.set(obj, 'b.g.1.0', 'test');
      objectPath.set(obj, 'b.g.1.1', 'test');
      objectPath.set(obj, 'b.h.az', 'test');
      objectPath.set(obj, 'b.\ubeef', 'test');
      objectPath.set(obj, ['b', 'dot.dot'], 'test');

      expect(obj).to.have.deep.property('b.g.1.0', 'test');
      expect(obj).to.have.deep.property('b.g.1.1', 'test');
      expect(obj).to.have.deep.property('b.h.az', 'test');
      expect(obj).to.have.deep.property('b.\ubeef', 'test');

      objectPath.del(obj, 'b.h.az');
      expect(obj).to.not.have.deep.property('b.h.az');
      expect(obj).to.have.deep.property('b.h');

      objectPath.del(obj, 'b.g.1.1');
      expect(obj).to.not.have.deep.property('b.g.1.1');
      expect(obj).to.have.deep.property('b.g.1.0', 'test');

      objectPath.del(obj, 'b.\ubeef');
      expect(obj).to.not.have.deep.property('b.\ubeef');

      objectPath.del(obj, ['b', 'dot.dot']);
      expect(objectPath.get(obj, ['b', 'dot.dot'])).to.be.equal(void 0);

      objectPath.del(obj, ['b', 'g', '1', '0']);
      expect(obj).to.not.have.deep.property('b.g.1.0');
      expect(obj).to.have.deep.property('b.g.1');

      expect(objectPath.del(obj, ['b'])).to.not.have.deep.property('b.g');
      expect(obj).to.be.deep.equal({ 'a': 'b' });
    });

    it('should remove items from existing array', function () {
      var obj = getTestObj();

      objectPath.del(obj, 'b.d.0');
      expect(obj.b.d).to.have.length(1);
      expect(obj.b.d).to.be.deep.equal(['b']);

      objectPath.del(obj, 'b.d.0');
      expect(obj.b.d).to.have.length(0);
      expect(obj.b.d).to.be.deep.equal([]);
    });

    it('should skip undefined paths', function () {
      var obj = getTestObj();

      expect(objectPath.del(obj, 'do.not.exist')).to.be.equal(obj);
      expect(objectPath.del(obj, 'a.c')).to.be.equal('b');
    });
  });

  describe('insert', function () {
    it('should insert value into existing array', function () {
      var obj = getTestObj();

      objectPath.insert(obj, 'b.c', 'asdf');
      expect(obj).to.have.deep.property('b.c.0', 'asdf');
      expect(obj).to.not.have.deep.property('b.c.1');
    });

    it('should create intermediary array', function () {
      var obj = getTestObj();

      objectPath.insert(obj, 'b.c.0', 'asdf');
      expect(obj).to.have.deep.property('b.c.0.0', 'asdf');
    });

    it('should insert in another index', function () {
      var obj = getTestObj();

      objectPath.insert(obj, 'b.d', 'asdf', 1);
      expect(obj).to.have.deep.property('b.d.1', 'asdf');
      expect(obj).to.have.deep.property('b.d.0', 'a');
      expect(obj).to.have.deep.property('b.d.2', 'b');
    });

    it('should handle sparse array', function () {
      var obj = getTestObj();
      obj.b.d = new Array(4);
      obj.b.d[0] = 'a';
      obj.b.d[1] = 'b';

      objectPath.insert(obj, 'b.d', 'asdf', 3);
      expect(obj.b.d).to.have.members([
        'a',
        'b',
        ,
        ,
        'asdf'
      ]);
    });
  });

  describe('has', function () {
    it('should throw for empty object', function () {
      expect(function(){
        objectPath.has({}, 'a');
      }).to.throw();
    });

    it('should throw for empty path', function () {
      var obj = getTestObj();
      expect(function(){
        objectPath.has(obj, '');
      }).to.throw();
      expect(function(){
        objectPath.has(obj, []);
      }).to.throw();
    });

    it('should test under shallow object', function () {
      var obj = getTestObj();
      expect(objectPath.has(obj, 'a')).to.be.equal(true);
      expect(objectPath.has(obj, ['a'])).to.be.equal(true);
      expect(objectPath.has(obj, 'z')).to.be.equal(false);
      expect(objectPath.has(obj, ['z'])).to.be.equal(false);
    });

    it('should work with number path', function () {
      var obj = getTestObj();
      expect(objectPath.has(obj.b.d, 0)).to.be.equal(true);
      expect(objectPath.has(obj.b, 0)).to.be.equal(false);
      expect(objectPath.has(obj.b.d, 10)).to.be.equal(false);
      expect(objectPath.has(obj.b, 10)).to.be.equal(false);
    });

    it('should test under deep object', function () {
      var obj = getTestObj();
      expect(objectPath.has(obj, 'b.f')).to.be.equal(true);
      expect(objectPath.has(obj, ['b', 'f'])).to.be.equal(true);
      expect(objectPath.has(obj, 'b.g')).to.be.equal(false);
      expect(objectPath.has(obj, ['b', 'g'])).to.be.equal(false);
    });

    it('should test value under array', function () {
      var obj = getTestObj();
      expect(objectPath.has(obj, 'b.d.0')).to.be.equal(true);
      expect(objectPath.has(obj, ['b', 'd', 0])).to.be.equal(true);
    });

    it('should test the value under array deep', function () {
      var obj = getTestObj();
      expect(objectPath.has(obj, 'b.e.1.f')).to.be.equal(true);
      expect(objectPath.has(obj, ['b', 'e', 1, 'f'])).to.be.equal(true);
      expect(objectPath.has(obj, 'b.e.1.f.g.h.i')).to.be.equal(false);
      expect(objectPath.has(obj, ['b', 'e', 1, 'f', 'g', 'h', 'i'])).to.be.equal(false);
    });

    it('should test the value under integer-like key', function () {
      var obj = { '1a': 'foo' };
      expect(objectPath.has(obj, '1a')).to.be.equal(true);
      expect(objectPath.has(obj, ['1a'])).to.be.equal(true);
    });

    it('should distinct nonexistent key and key = undefined', function () {
      var obj = {};
      expect(function(){
        objectPath.has(obj, 'key');
      }).to.throw();

      obj.key = undefined;
      expect(objectPath.has(obj, 'key')).to.be.equal(true);
    });

    if (typeof Symbol === 'function') {
      it('should work with symbols', function(){
        var obj = {};
        obj[Symbol.for('somesymbol')] = true;

        expect(objectPath.has(obj, Symbol())).to.be.equal(false);
        expect(objectPath.has(obj, [Symbol()])).to.be.equal(false);
        expect(objectPath.has(obj, [Symbol.for('somesymbol')])).to.be.equal(true);
        expect(objectPath.has(obj, Symbol.for('somesymbol'))).to.be.equal(true);
      });
    }
  });



  describe('bind object', function () {
    // just get one scenario from each feature, so whole functionality is proxied well
    it('should return the value under shallow object', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);
      expect(model.get('a')).to.be.equal('b');
      expect(model.get(['a'])).to.be.equal('b');
    });

    it('should set value under shallow object', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);
      model.set('c', { m: 'o' });
      expect(obj).to.have.deep.property('c.m', 'o');
      obj = getTestObj();
      model = objectPath.bind(obj);
      model.set(['c'], { m: 'o' });
      expect(obj).to.have.deep.property('c.m', 'o');
    });

    it('should push value to existing array', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);
      model.push('b.c', ['l']);
      expect(obj).to.have.deep.property('b.c.0', 'l');
      obj = getTestObj();
      model = objectPath.bind(obj);
      model.push(['b', 'c'], ['l']);
      expect(obj).to.have.deep.property('b.c.0', 'l');
    });

    it('should create the path if it does not exists', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);
      var oldVal = model.ensureExists('b.g.1.l', 'test');
      expect(oldVal).to.not.exist;
      expect(obj).to.have.deep.property('b.g.1.l', 'test');
      oldVal = model.ensureExists('b.g.1.l', 'test1');
      expect(oldVal).to.be.equal('test');
      expect(obj).to.have.deep.property('b.g.1.l', 'test');
    });

    it('should return the first non-undefined value', function () {
      var obj = {
        should: { have: 'prop' }
      };
      var model = objectPath.bind(obj);

      expect(model.coalesce([
        'doesnt.exist',
        ['might', 'not', 'exist'],
        'should.have'
      ])).to.equal('prop');
    });

    it('should empty each path according to their types', function () {
      function Instance() {
        this.notOwn = true;
      }

      /*istanbul ignore next: not part of code */
      Instance.prototype.test = function () { };
      /*istanbul ignore next: not part of code */
      Instance.prototype.arr = [];

      var
        obj = {
          string: 'some string',
          array: ['some', 'array', [1, 2, 3]],
          number: 21,
          boolean: true,
          object: {
            some: 'property',
            sub: {
              'property': true
            }
          },
          instance: new Instance()
        };

      /*istanbul ignore next: not part of code */
      obj['function'] = function () { };

      var model = objectPath.bind(obj);

      model.empty(['array', '2']);
      expect(obj.array[2]).to.deep.equal([]);

      model.empty('object.sub');
      expect(obj.object.sub).to.deep.equal({});

      model.empty('instance.test');
      expect(obj.instance.test).to.equal(null);
      expect(Instance.prototype.test).to.be.a('function');

      model.empty('string');
      model.empty('number');
      model.empty('boolean');
      model.empty('function');
      model.empty('array');
      model.empty('object');
      model.empty('instance');

      expect(obj.string).to.equal('');
      expect(obj.array).to.deep.equal([]);
      expect(obj.number).to.equal(0);
      expect(obj.boolean).to.equal(false);
      expect(obj.object).to.deep.equal({});
      expect(obj.instance.notOwn).to.be.an('undefined');
      expect(obj.instance.arr).to.be.an('array');
      expect(obj['function']).to.equal(null);
    });

    it('should delete deep paths', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);

      model.set('b.g.1.0', 'test');
      model.set('b.g.1.1', 'test');
      model.set('b.h.az', 'test');

      expect(obj).to.have.deep.property('b.g.1.0', 'test');
      expect(obj).to.have.deep.property('b.g.1.1', 'test');
      expect(obj).to.have.deep.property('b.h.az', 'test');

      model.del('b.h.az');
      expect(obj).to.not.have.deep.property('b.h.az');
      expect(obj).to.have.deep.property('b.h');

      model.del('b.g.1.1');
      expect(obj).to.not.have.deep.property('b.g.1.1');
      expect(obj).to.have.deep.property('b.g.1.0', 'test');

      model.del(['b', 'g', '1', '0']);
      expect(obj).to.not.have.deep.property('b.g.1.0');
      expect(obj).to.have.deep.property('b.g.1');

      expect(model.del(['b'])).to.not.have.deep.property('b.g');
      expect(obj).to.be.deep.equal({ 'a': 'b' });
    });

    it('should insert value into existing array', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);

      model.insert('b.c', 'asdf');
      expect(obj).to.have.deep.property('b.c.0', 'asdf');
      expect(obj).to.not.have.deep.property('b.c.1');
    });

    it('should test under shallow object', function () {
      var obj = getTestObj();
      var model = objectPath.bind(obj);

      expect(model.has('a')).to.be.equal(true);
      expect(model.has(['a'])).to.be.equal(true);
      expect(model.has('z')).to.be.equal(false);
      expect(model.has(['z'])).to.be.equal(false);
    });

  });

  describe('extend', function () {

    it('adds functions to the instance', function () {
      objectPath.extend(function () {
        return {
          fn: function () {
            return true;
          }
        };
      });

      expect(objectPath.fn()).to.equal(true);
    });

    it('passes the internal functions that are constant', function () {
      objectPath.extend(function (base) {
        for (var x in base) {
          delete base[x];
        }
      });

      objectPath.extend(function (base) {
        expect(base.get).to.be.a('function');
        expect(base.del).to.be.a('function');
      });
    });

    it('can use internal functions', function () {
      objectPath.extend(function (base) {
        return {
          opts: base.merge('', {}, { hola: [] })
        };
      });

      expect(objectPath.opts).to.deep.equal({ hola: [] });
    });

  });

  describe('internal function', function () {

    describe('merge', function () {

      it('can merge many objects', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.merge({ obj1: false }, { obj1: true, obj2: false }, { obj2: true })).to.deep.equal({ obj1: true, obj2: true });
        });

      });

      it('ignore non objects', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.merge({ obj1: false }, 'ok', false)).to.deep.equal({ obj1: false });
        });

      });

    });

    describe('isEmpty', function () {

      it('check for empty objects', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.isEmpty({})).to.equal(true);
          expect(objectPath.isEmpty([])).to.equal(true);
          expect(objectPath.isEmpty([1])).to.equal(false);
          expect(objectPath.isEmpty(1)).to.equal(false);
          expect(objectPath.isEmpty(0)).to.equal(false);
          expect(objectPath.isEmpty('0')).to.equal(false);
          expect(objectPath.isEmpty('1')).to.equal(false);
          expect(objectPath.isEmpty(function(){ })).to.equal(true);
          expect(objectPath.isEmpty('')).to.equal(true);
          if (typeof Symbol === 'function') {
            expect(objectPath.isEmpty(Symbol())).to.equal(false);
          }
        });

      });

      it('alternate ownProperties and not', function () {
        var obj = getTestObj();

        objectPath.extend(function(objectPath){
          expect(objectPath.isEmpty(Object.create(obj))).to.equal(true);
          expect(objectPath.isEmpty(Object.create(obj), false)).to.equal(false);
        });

      });

    });

    describe('isNumber', function () {

      it('can detect real numbers', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.isNumber(1)).to.equal(true);
          expect(objectPath.isNumber('1')).to.equal(false);
          expect(objectPath.isNumber('a')).to.equal(false);
        });

      });

    });

    describe('isString', function () {

      it('can test for strings', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.isString('')).to.equal(true);
          expect(objectPath.isString(false)).to.equal(false);
          expect(objectPath.isString(3)).to.equal(false);
        });

      });

    });

    describe('isObject', function () {

      it('can test for objects', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.isObject({})).to.equal(true);
          expect(objectPath.isObject([])).to.equal(false);
          expect(objectPath.isObject(0)).to.equal(false);
          expect(objectPath.isObject(false)).to.equal(false);
          expect(objectPath.isObject('')).to.equal(false);
          expect(objectPath.isObject('asdfa')).to.equal(false);
          expect(objectPath.isObject(null)).to.equal(false);
          expect(objectPath.isObject(void 0)).to.equal(false);
          expect(objectPath.isObject(function () { })).to.equal(false);
        });

      })

    });

    describe('isArray', function () {

      it('can test for arrays', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.isArray([])).to.equal(true);
          expect(objectPath.isArray({})).to.equal(false);
          expect(objectPath.isArray(null)).to.equal(false);
          expect(objectPath.isArray(false)).to.equal(false);
          expect(objectPath.isArray('ok')).to.equal(false);
        });

      });

    });

    describe('isBoolean', function () {

      it('can test for boolean', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.isBoolean(true)).to.equal(true);
          expect(objectPath.isBoolean(false)).to.equal(true);
          expect(objectPath.isBoolean('true')).to.equal(false);
        });

      });

    });

    describe('getKey', function () {

      it('gets int key', function () {

        objectPath.extend(function(objectPath){
          expect(objectPath.getKey('1')).to.equal(1);
          expect(objectPath.getKey('a')).to.equal('a');
          expect(objectPath.getKey(1)).to.equal(1);
          expect(objectPath.getKey(false)).to.equal(false);
          expect(objectPath.getKey({})).to.deep.equal({});
        });

      });

    });

    if (typeof Symbol === 'function') {

      describe('isSymbol', function () {

        it('detect symbols', function () {

          objectPath.extend(function(objectPath){
            expect(objectPath.isSymbol('1')).to.equal(false);
            expect(objectPath.isSymbol(2)).to.equal(false);
            expect(objectPath.isSymbol(Symbol())).to.equal(true);
            expect(objectPath.isSymbol(Symbol.for('objectPath'))).to.equal(true);
          });

        });

      });

    }

    describe('ObjectPathError', function(){

      it('inherits from Error and ReferenceError', function(){

        expect(function(){
          throw new objectPath.ObjectPathError('test');
        }).to.throw().and.be.instanceof(Error);

        expect(function(){
          throw new objectPath.ObjectPathError('test');
        }).to.throw().and.be.instanceof(ReferenceError);

        expect(function(){
          throw new objectPath.ObjectPathError('test');
        }).to.throw().and.be.instanceof(objectPath.ObjectPathError);

      });

    });

  });

});

