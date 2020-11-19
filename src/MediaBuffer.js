var MediaBuffer = function(mimeType, chunksDuration, bufferHeader){
	var scope = this;
	scope.source = new MediaSource();
	scope.objectURL = URL.createObjectURL(scope.source);

	var removing = false;
	var totalTime = 0;
	var removeCount = 10;
	var sourceBuffer = null;
	var buffers = [];

	scope.source.onsourceopen = function(){
		sourceBuffer = scope.source.addSourceBuffer(mimeType);
		sourceBuffer.mode = 'sequence';
		sourceBuffer.appendBuffer(bufferHeader);

		sourceBuffer.onerror = console.error;
		sourceBuffer.onupdateend = function(){
			if(removing){
				removing = false;
				totalTime = 0;
				sourceBuffer.remove(0, removeCount);
				removeCount = 20;
				return;
			}

			if(!sourceBuffer.updating && buffers.length !== 0)
				startAppending(buffers.shift());
		};
	};

	function startAppending(buffer){
		sourceBuffer.appendBuffer(buffer);
		totalTime += chunksDuration;
		// console.log(totalTime, buffer);
	}

	scope.source.onerror = console.error;

	scope.append = function(arrayBuffer){
		if(sourceBuffer === null)
			return false;

		if(sourceBuffer.buffered.length === 2)
			console.log('something wrong');

		if(totalTime >= 20000)
			removing = true;

		if(!sourceBuffer.updating)
			startAppending(arrayBuffer);
		else
			buffers.push(arrayBuffer);

		return totalTime/1000;
	}

	scope.stop = function(){
		if(sourceBuffer.updating)
			sourceBuffer.abort();

		if(scope.source.readyState === "open")
			scope.source.endOfStream();
	}
}