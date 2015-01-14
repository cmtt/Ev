var emitter,nodeExport;
// if(typeof exports === "undefined"){
//   emitter = new eventEmitter();
// }else{
//    nodeExport = require("./emitter");
//    emitter = new nodeExport.eventEmitter();

// }
emitter = {};
Ev(emitter);

var echoErrorOnly=1;
describe('Ported eventEmitter tests', function () {

  it('succeedes', function () {

    testSetMaxListener(emitter);
    testAddListener(emitter);
    testEmit(emitter);
    testRemoveListener(emitter);
    testOnce(emitter);
    testRemoveAllListener(emitter);
    testListeners(emitter);
    testListenerCount(emitter);
  });


});

function assertEmitterTest(actualValue,expectedValue,echoErrorOnly){

  var testSuiteIdentifier=arguments.callee.caller.name;

  echoErrorOnly = typeof echoErrorOnly !== 'undefined' ? echoErrorOnly : 1;
  assert.equal(actualValue, expectedValue, testSuiteIdentifier+" :Assertion passes: Actual value="+actualValue);
}



//bind not used as old IE's dont support it :(
function assertException(self,functionReference){
  var args = Array.prototype.slice.call(arguments, 2);
  var exceptionFlag = 1;
  var testSuiteIdentifier=arguments.callee.caller.name;

  assert.throws(function () {
    functionReference.apply(self,args);
  });
}


function testSetMaxListener(emitter) {
  emitter.setMaxListeners(100);
  // assertEmitterTest(emitter.emitterMaxListener,100,echoErrorOnly);


  assertException(this,emitter.setMaxListeners,NaN);
  assertException(this,emitter.setMaxListeners,null);
  assertException(this,emitter.setMaxListeners,undefined);
  assertException(this,emitter.setMaxListeners,-10);
  assertException(this,emitter.setMaxListeners,10.23);
}


function testAddListener(emitter){
  function testListener1(){
  }

  function testListener2(){
  }

  emitter.addListener("test1",testListener1);
  assertEmitterTest(Ev.listenerCount(emitter,'test1').length,1,echoErrorOnly);

  emitter.addListener("test1",testListener1);
  assertEmitterTest(Ev.listenerCount(emitter,'test1').length,2,echoErrorOnly);

  emitter.addListener("test1",testListener2);
  assertEmitterTest(Ev.listenerCount(emitter,'test1').length,3,echoErrorOnly);

  emitter.addListener("test2",testListener2);
  assertEmitterTest(Ev.listenerCount(emitter,'test2').length,1,echoErrorOnly);
  assertEmitterTest(Ev.listenerCount(emitter,'test1').length,3,echoErrorOnly);

  emitter.addListener("test2",testListener1);
  assertEmitterTest(Ev.listenerCount(emitter,'test2').length,2,echoErrorOnly);
  assertEmitterTest(Ev.listenerCount(emitter,'test1').length,3,echoErrorOnly);

  assertEmitterTest(Ev.listenerCount(emitter,'test2')[0].name,"testListener2",echoErrorOnly);
  assertEmitterTest(Ev.listenerCount(emitter,'test2')[1].name,"testListener1",echoErrorOnly);
  assertEmitterTest(Ev.listenerCount(emitter,'test1')[0].name,"testListener1",echoErrorOnly);
  assertEmitterTest(Ev.listenerCount(emitter,'test1')[1].name,"testListener1",echoErrorOnly);
  assertEmitterTest(Ev.listenerCount(emitter,'test1')[2].name,"testListener2",echoErrorOnly);

  assertException(this,emitter.addListener,"test",2);

  assertException(this,emitter.addListener,"test","testListener1");
  assertException(this,emitter.addListener,2,testListener1);
  assertException(this,emitter.addListener,testListener1,testListener1);

}



function testEmit(emitter){
  // this repeating code could have been moved to a function, not done but
  var testResult={};
  var count=0;
  function testListener1(event){
    testResult[event+count++]=arguments.callee.name;
  }
  function testListener2(event){
    testResult[event+count++]=arguments.callee.name;
  }
  emitter.addListener("test1",testListener1);
  emitter.addListener("test1",testListener2);
  emitter.addListener("test2",testListener2);
  emitter.addListener("test2",testListener1);
  emitter.addListener("test2",testListener1);
  emitter.addListener("test2",testListener2);
  emitter.emit("test1","test1-");

  assertEmitterTest(testResult["test1-0"],"testListener1",echoErrorOnly);
  assertEmitterTest(testResult["test1-1"],"testListener2",echoErrorOnly);

  emitter.emit("test2","test2-");
  assertEmitterTest(testResult["test2-2"],"testListener2",echoErrorOnly);
  assertEmitterTest(testResult["test2-3"],"testListener1",echoErrorOnly);
  assertEmitterTest(testResult["test2-4"],"testListener1",echoErrorOnly);
  assertEmitterTest(testResult["test2-5"],"testListener2",echoErrorOnly);

  assertException(this,emitter.emit,2);
  assertException(this,emitter.emit,undefined);
  assertException(this,emitter.emit,{});
}


function testOnce(emitter){
  var testResult={};
  var count=0;
  function testListener1(event){
    testResult[event]=++count;
  }
  emitter.once("test3",testListener1);
  emitter.emit("test3","test3");
  emitter.emit("test3","test3");

  assertEmitterTest(testResult.test3,1,echoErrorOnly);

  assertException(this,emitter.once);
  assertException(this,emitter.emit,undefined,testListener1);
  assertException(this,emitter.emit,"",undefined);
}

function testRemoveListener(emitter){
  var testResult={};
  var count=0;
  function testListener1(event){
    testResult[event]=++count;
  }
  emitter.addListener("test2",testListener1);
  emitter.emit("test2","test2");
  emitter.removeListener("test2",testListener1);
  emitter.addListener("test4",testListener1);
  emitter.removeListener("test4",testListener1);

  assert.deepEqual(Ev.listenerCount(emitter,'test4'),[]);
  assertEmitterTest(testResult.test2,1,echoErrorOnly);
}

function testRemoveAllListener(emitter){
  assertEmitterTest(Ev.listenerCount(emitter,'test2').length,6,echoErrorOnly);
  emitter.removeAllListeners("test2");
  assert.deepEqual(Ev.listenerCount(emitter,'test2'), []);
  // assertEmitterTest(Ev.listenerCount(emitter,'test2'),undefined,echoErrorOnly);
  emitter.removeAllListeners(null);
  assertEmitterTest(Object.keys(emitter.listeners()).length,0,echoErrorOnly);
}

function testListeners(emitter){
  function testListener1(){

  }

  emitter.removeAllListeners(null);

  emitter.addListener("test1",testListener1);
  emitter.addListener("test1",testListener1);
  var listeners=emitter.listeners("test1");
  assertEmitterTest(listeners.length,2,echoErrorOnly);
  assertEmitterTest(typeof listeners[0],"function",echoErrorOnly);
}

function testListenerCount(emitter){
  function testListener1(){

  }

  emitter.removeAllListeners(null);
  assertEmitterTest(emitter.listeners("test").length,0,echoErrorOnly);

  emitter.addListener("test",testListener1);
  emitter.addListener("test",testListener1);
  emitter.addListener("test",testListener1);
  assertEmitterTest(emitter.listeners("test").length,3,echoErrorOnly);
}
