describe('Ev', function () {

  it('is a function', function () {
    assert.ok(typeof Ev === 'function','Ev s a function');
  });

  it ('returns the initial object', function () {
    var obj = {
      id : '2'
    };
    var retval = Ev(obj);
    assert.ok(retval);
    assert.equal(retval.id, '2');
  });

  it ('listens to an event', function () {
    var obj = {};
    Ev(obj);
    assert.ok(typeof obj.bind === 'function');
    assert.ok(typeof obj.unbind === 'function');
    assert.ok(typeof obj.trigger === 'function');
  });


  describe('#add()', function () {
    function handler () {}
    var ev = {};
    Ev(ev);

    describe('aliases', function () {
      it('addListener === on', function (done) {
        assert.deepEqual(ev.addListener, ev.on)
        done()
      })
      it('addListener === addEventListener', function (done) {
        assert.deepEqual(ev.addListener, ev.addEventListener)
        done()
      })
    })

    describe('[newListener]', function () {
      var ev = {};
      Ev(ev);

      var count = 0

      it('should emit [newListener] when a listener is added', function (done) {
        ev.on('newListener', function (event, listener) {
          count++
          assert.equal(count, 1)
          assert.equal(event, 'match')
          assert.equal(listener, handler)
          done()
        })
        ev.on('match', handler)
      })
    })
  })

  describe('dedupListener property', function () {
    describe('if not set', function () {
      var ev = {};
      Ev(ev);

      var count = 0

      function handler () {
        count++
      }

      it('should not apply', function (done) {
        ev.on('match', handler)
        ev.on('match', handler)
        // ev.emit_match()
        ev.trigger('match');
        assert.equal(count, 2)
        done()
      })
    })

    describe('if set', function () {
      var ev = {};
      Ev(ev);
      var count = 0

      function handler () {
        count++
      }

      it('should apply', function (done) {
        ev.dedupListener = true
        ev.on('match', handler)
        ev.on('match', handler)
        ev.trigger('match');
        // ev.emit_match()
        assert.equal(count, 1)
        done()
      })
    })
  })



  describe('#emit()', function () {
    // describe('shortcut', function () {
    //   var ev = {};
    //   Ev(ev);

    //   it('emit_match', function (done) {
    //     assert.deepEqual(typeof ev.emit_match, 'function')
    //     done()
    //   })
    // })

    describe('emit("match")', function () {
      it('should trigger the handler with its arguments', function (done) {
        var ev = {};
        Ev(ev);

        function handler (a, b) {
          assert.equal(a, 'a')
          assert.equal(b, 'b')
          done()
        }
        ev.on('match', handler)
        ev.emit('match', 'a', 'b')
      })

      it('should trigger the handler with its arguments', function (done) {
        var ev = {};
      Ev(ev);

        function handler (a, b, c, d) {
          assert.equal(a, 'a')
          assert.equal(b, 'b')
          assert.equal(c, 'c')
          assert.equal(d, 'd')
          done()
        }
        ev.on('match', handler)
        ev.emit('match', 'a', 'b', 'c', 'd')
      })
    })

    describe('emit_match', function () {
      it('should emit trigger the handler with its arguments', function (done) {
        var ev = {};
        Ev(ev);

        function handler (a, b) {
          assert.equal(a, 'a')
          assert.equal(b, 'b')
          done()
        }
        ev.on('match', handler)
        // ev.emit_match('a', 'b')
        ev.trigger('match', 'a', 'b');

      })

      it('should emit trigger the handler with its arguments', function (done) {
        var ev = {};
      Ev(ev);

        function handler (a, b, c, d) {
          assert.equal(a, 'a')
          assert.equal(b, 'b')
          assert.equal(c, 'c')
          assert.equal(d, 'd')
          done()
        }
        ev.on('match', handler)
        // ev.emit_match('a', 'b', 'c', 'd')
        ev.trigger('match', 'a', 'b', 'c', 'd');

      })
    })

    describe('arguments', function () {
      var ev = {};
      Ev(ev);
      var args = []

      it('should emit trigger the handler with all its arguments', function (done) {
        function handler () {
          args.push(arguments.length)
        }
        ev.on('match', handler)
        ev.trigger('match')
        ev.trigger('match',null)
        ev.trigger('match',null, null)
        ev.trigger('match',null, null, null)
        ev.trigger('match',null, null, null, null)
        ev.trigger('match',null, null, null, null, null)
        assert.deepEqual(args, [0, 1, 2, 3, 4, 5])
        done()
      })
    })

    describe('emitter changed while emitting', function () {
      var ev = {};
      Ev(ev);
      var callbacks_called = []

      function callback1 () {
        callbacks_called.push('callback1')
        ev.on('match', callback2)
        ev.on('match', callback3)
        ev.off('match', callback1)
      }

      function callback2 () {
        callbacks_called.push('callback2')
        ev.off('match', callback2)
      }

      function callback3 () {
        callbacks_called.push('callback3')
        ev.off('match', callback3)
      }

      it('should maintain its listeners', function (done) {
        ev.on('match', callback1)
        // Make sure callback1 is there
        assert.equal(1, ev.listeners('match').length)

        // Make sure callback2 and callback3 are there and callback1 got called
        ev.trigger('match')
        assert.equal(2, ev.listeners('match').length)
        assert.deepEqual( ['callback1'], callbacks_called)

        // Make sure all callbacks got called and no more listeners attached
        ev.trigger('match')
        // assert.equal(0, ev.listeners('match').length)
        assert.deepEqual( ['callback1','callback2','callback3'], callbacks_called)

        // Nothing should changed upon new emission
        ev.trigger('match')
        assert.equal(0, ev.listeners('match').length)
        assert.deepEqual( ['callback1','callback2','callback3'], callbacks_called)

        done()
      })

      it('should emit to all listeners while removing callbacks', function (done) {
        callbacks_called = []

        // Basic checks
        ev.on('match', callback2)
        ev.on('match', callback3)
        assert.equal(2, ev.listeners('match').length)
        ev.removeAllListeners('match')
        assert.equal(0, ev.listeners('match').length)

        ev.on('match', callback2)
        ev.on('match', callback3)
        ev.emit('match')
        assert.deepEqual( ['callback2', 'callback3'], callbacks_called )
        assert.equal(0, ev.listeners('match').length)

        done()
      })
    })
  })


  describe('Emitting the error event', function () {
    function handler () {}

    describe('with no listener attached', function () {
      var p = {}
      Ev(p);
      it('should throw an Error', function (done) {
        assert.throws(
          function () {
            p.trigger('error', new Error('this is a test') )
          }
        , function (err) {
            if (err instanceof Error) return true
          }
        )
        done()
      })
    })

    describe('with a listener attached', function () {
      var p = {};
      Ev(p);
      it('should not throw an Error', function (done) {
        p.on('error', function () {})
        assert.doesNotThrow(
          function () {
            p.trigger('error', new Error('this is a test') )
          }
        , function (err) {
            if (err instanceof Error) return true
          }
        )
        done()
      })
    })
  })


  describe('#setMaxListeners()', function () {
    function handler () {}

    describe('default', function () {
      describe('<= 10', function () {
        var ev = {};
        Ev(ev);

        it('should not warn', function (done) {
          for (var i = 0; i < 10; i++)
            ev.on('match', handler)

          assert.equal(ev._ev_maxWarning.match, false)
          done()
        })
      })

      describe('> 10', function () {
        var ev = {};
        Ev(ev);
        it('should warn', function (done) {
          for (var i = 0; i < 11; i++)
            ev.on('match', handler)

          assert.equal(ev._ev_maxWarning.match, true)
          done()
        })
      })
    })

    describe('5', function () {
      describe('<= 5', function () {
        var ev = {};
        Ev(ev);
        ev.setMaxListeners(5)

        it('should not warn', function (done) {
          for (var i = 0; i < 5; i++)
            ev.on('match', handler)

          assert.equal(ev._ev_maxWarning.match, false)
          done()
        })
      })

      describe('> 5', function () {
        var ev = {};
        Ev(ev);
        ev.setMaxListeners(5)

        it('should warn', function (done) {
          for (var i = 0; i < 6; i++)
            ev.on('match', handler)

          assert.equal(ev._ev_maxWarning.match, true)
          done()
        })
      })
    })

    describe('1', function () {
      describe('<= 1', function () {
        var ev = {};
        Ev(ev);
        ev.setMaxListeners(1)

        it('should not warn', function (done) {
          for (var i = 0; i < 1; i++)
            ev.on('match', handler)

          assert.equal(ev._ev_maxWarning.match, false)
          done()
        })
      })

      describe('> 1', function () {
        var ev = {};
        Ev(ev);
        ev.setMaxListeners(1)

        it('should warn', function (done) {
          for (var i = 0; i < 2; i++)
            ev.on('match', handler)

          assert.equal(ev._ev_maxWarning.match, true)
          done()
        })
      })
    })

    describe('0', function () {
      var ev = {};
      Ev(ev);
      ev.setMaxListeners(0)

      it('should not warn', function (done) {
        for (var i = 0; i < 1000; i++)
          ev.on('match', handler)

        assert.equal(ev._ev_maxWarning.match, false)
        done()
      })
    })
  })


  describe('#once()', function () {
    describe('with multiple emissions', function () {
      var ev = {};
      Ev(ev);
      var count = 0

      it('should only trigger once', function (done) {
        ev.once('match', function () {
          count++
        })
        ev.trigger('match')
        ev.trigger('match')
        ev.trigger('match')
        ev.trigger('match')
        ev.trigger('match')
        assert.equal(count, 1)
        done()
      })
    })

    describe('removed', function () {
      var ev = {};
      Ev(ev);

      it('should not trigger', function (done) {
        function removed () {
          done( new Error('should not trigger') )
        }
        ev.once('match', removed)
        ev.off('match', removed)
        ev.trigger('match')
        done()
      })
    })

    describe('arguments', function () {
      var ev = {};
      Ev(ev);
      var args = []

      it('should emit trigger the handler with all its arguments', function (done) {
        function handler () {
          args.push(arguments.length)
        }
        ev.once('match', handler)
        ev.trigger('match',null, null)
        assert.deepEqual(args, [2])
        done()
      })
    })

    // TODO test once([ev1,ev2], listener)
  })



  describe('#removeAllListeners()', function () {
    function handler () {}

    describe('for event [foo]', function () {
      var ev = {};
      Ev(ev);

      it('should only remove the listener for [foo]', function (done) {
        ev.on('foo', handler)
        ev.on('bar', handler)
        ev.removeAllListeners('foo')
        assert.deepEqual( [], ev.listeners('foo') )
        assert.deepEqual( [handler], ev.listeners('bar') )
        done()
      })
    })

    describe('for all events', function () {
      var ev = {};
      Ev(ev);

      it('should remove all listeners', function (done) {
        ev.on('foo', handler)
        ev.on('bar', handler)
        ev.removeAllListeners()
        assert.deepEqual( [], ev.listeners('foo') )
        assert.deepEqual( [], ev.listeners('bar') )
        done()
      })
    })
  })


  describe('#removeListener()', function () {
    function handler1 () {}
    function handler2 () {}

    var ev = {};
    Ev(ev);

    describe('alias', function () {
      it('removeListener === off', function (done) {
        assert.deepEqual(ev.removeListener, ev.off)
        done()
      })
    })

    describe('removing the only listener', function () {
      var ev = {};
      Ev(ev);

      it('should remove the listener', function (done) {
        ev.on('match', handler1)
        ev.off('match', handler1)
        assert.deepEqual( [], ev.listeners('match') )
        done()
      })
    })

    describe('removing a non existing listener', function () {
      var ev = {};
      Ev(ev);

      it('should not remove existing listeners', function (done) {
        ev.on('match', handler1)
        ev.off('match', handler2)
        assert.deepEqual( [handler1], ev.listeners('match') )
        done()
      })
    })

    describe('removing an existing listener', function () {
      var ev = {};
      Ev(ev);
      it('should not remove other listeners', function (done) {
        ev.on('match', handler1)
        ev.on('match', handler2)
        ev.off('match', handler2)
        assert.deepEqual( [handler1], ev.listeners('match') )
        done()
      })
    })

    describe('removing an existing listener', function () {
      var ev = {};
      Ev(ev);

      // it('should emit oldListener', function (done) {
      //   ev.on('oldListener', function (ev, listener) {
      it('should emit removeListener', function (done) {
        ev.on('removeListener', function (ev, listener) {

          assert.equal(ev, 'match')
          assert.deepEqual(listener, handler1)
          done()
        })
        ev.on('match', handler1)
        ev.off('match', handler1)
      })
    })
  })


  describe('listeners scope', function () {
    describe('with 1 listener', function () {
      var ev = {};
      Ev(ev);

      it('should be set properly', function (done) {
        function handler () {
          assert.deepEqual(this, ev)
          done()
        }

        ev.on('match', handler)
        ev.emit('match', 1, 2)
      })
    })

    describe('with 2 listeners', function () {
      var ev = {};
      Ev(ev);

      it('should be set properly', function (done) {
        function handler1 () {
          assert.deepEqual(this, ev)
        }
        function handler2 () {
          assert.deepEqual(this, ev)
          done()
        }

        ev.on('match', handler1)
        ev.on('match', handler2)
        ev.emit('match', 1, 2)
      })
    })

    describe('with >2 listeners', function () {
      var ev = {};
      Ev(ev);

      it('should be set properly', function (done) {
        function handler1 () {
          assert.deepEqual(this, ev)
        }
        function handler2 () {
          assert.deepEqual(this, ev)
        }
        function handler3 () {
          assert.deepEqual(this, ev)
          done()
        }

        ev.on('match', handler1)
        ev.on('match', handler2)
        ev.on('match', handler3)
        ev.emit('match', 1, 2)
      })
    })
  })

});
