// Metronome part
var url = 'click.mp3',      
    audioContext = null,
    isPlaying = false,
    current4Note, 
    tempo = 120,
    lookahead = 1,
    nextNoteTime = 0,
    scheduleAheadTime = 0.1,
    loadClick,
    source,
    click;

function init () {
 
 // Checking browser for WebAudio Support
 try {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  catch(e) {
    alert("Web Audio API is not supported in this browser");
  }  

// Asynchronously load click sound from server
  loadClick = new BufferLoader(audioContext, [url], 
    function(bufferList){click = bufferList[0];});
  loadClick.load();
}

function play () {

  isPlaying = !isPlaying;

  if ( isPlaying ) {
    current4Note = 0;
    nextNoteTime = audioContext.currentTime;
    scheduler();
    return stopImg;
  } else {
    window.clearTimeout( timerID );
    return playImg;
  }

}

function scheduler() {

  // if (time < audioContext.currentTime < nextNoteTime && lastNote) {
  //   lastNote = false;
  //   console.log('go');
  //   for (var bar = 0; bar < 4; bar++) {
  //     var time = nextNoteTime + bar * tempo;
  //     scheduleNote(time);  
  //   }
  //   lastNote = true;
  //   nextNoteTime = time + 0.5;
  //  } 
  //}

  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        scheduleNote( nextNoteTime );
        nextNote();
    }
     timerID = window.setTimeout( scheduler, lookahead );
}

function scheduleNote(time) {

  source = audioContext.createBufferSource();
  source.buffer = click;
  source.connect(audioContext.destination);
  source.start(time);
  source.stop( time + 0.1 ); 

}

function nextNote() {

  var intervalSec = 60 / tempo;
  nextNoteTime += intervalSec;

  // TODO: make accent
  // current4Note++;
  // if (current4Note == 4) {
  //       current4Note = 0;
  //   }
}

// XML request for sound load
// TODO: rewrite this to simple function!
  function BufferLoader( context, urlList, callback ) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
  }

  BufferLoader.prototype.loadBuffer = function( url, index ) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
      // Asynchronously decode the audio file data in request.response
      loader.context.decodeAudioData(
        request.response,
        function(buffer) {
          if (!buffer) {
            alert( 'error decoding file data: ' + url );
            return;
          }
          loader.bufferList[index] = buffer;
          if ( ++loader.loadCount == loader.urlList.length )
            loader.onload( loader.bufferList );
        },
        function(error) {
          console.error( 'decodeAudioData error', error );
        }
      );
    }

    request.onerror = function() {
      alert('BufferLoader: XHR error');
    }

    request.send();
  }

  BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
  }
