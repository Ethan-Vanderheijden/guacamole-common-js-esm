/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ArrayBufferWriter } from './ArrayBufferWriter.js';
import { AudioContextFactory } from './AudioContextFactory.js';
import { Status } from './Status.js';
import { RawAudioFormat } from './RawAudioFormat.js';

/**
 * Abstract audio recorder which streams arbitrary audio data to an underlying
 * OutputStream. It is up to implementations of this class to provide
 * some means of handling this OutputStream. Data produced by the
 * recorder is to be sent along the provided stream immediately.
 *
 * @constructor
 */
function AudioRecorder() {

    /**
     * Callback which is invoked when the audio recording process has stopped
     * and the underlying Guacamole stream has been closed normally. Audio will
     * only resume recording if a new AudioRecorder is started. This
     * AudioRecorder instance MAY NOT be reused.
     *
     * @event
     */
    this.onclose = null;

    /**
     * Callback which is invoked when the audio recording process cannot
     * continue due to an error, if it has started at all. The underlying
     * Guacamole stream is automatically closed. Future attempts to record
     * audio should not be made, and this AudioRecorder instance
     * MAY NOT be reused.
     *
     * @event
     */
    this.onerror = null;

};

/**
 * Determines whether the given mimetype is supported by any built-in
 * implementation of AudioRecorder, and thus will be properly handled
 * by AudioRecorder.getInstance().
 *
 * @param {!string} mimetype
 *     The mimetype to check.
 *
 * @returns {!boolean}
 *     true if the given mimetype is supported by any built-in
 *     AudioRecorder, false otherwise.
 */
AudioRecorder.isSupportedType = function isSupportedType(mimetype) {

    return RawAudioRecorder.isSupportedType(mimetype);

};

/**
 * Returns a list of all mimetypes supported by any built-in
 * AudioRecorder, in rough order of priority. Beware that only the
 * core mimetypes themselves will be listed. Any mimetype parameters, even
 * required ones, will not be included in the list. For example, "audio/L8" is
 * a supported raw audio mimetype that is supported, but it is invalid without
 * additional parameters. Something like "audio/L8;rate=44100" would be valid,
 * however (see https://tools.ietf.org/html/rfc4856).
 *
 * @returns {!string[]}
 *     A list of all mimetypes supported by any built-in
 *     AudioRecorder, excluding any parameters.
 */
AudioRecorder.getSupportedTypes = function getSupportedTypes() {

    return RawAudioRecorder.getSupportedTypes();

};

/**
 * Returns an instance of AudioRecorder providing support for the
 * given audio format. If support for the given audio format is not available,
 * null is returned.
 *
 * @param {!OutputStream} stream
 *     The OutputStream to send audio data through.
 *
 * @param {!string} mimetype
 *     The mimetype of the audio data to be sent along the provided stream.
 *
 * @return {AudioRecorder}
 *     A AudioRecorder instance supporting the given mimetype and
 *     writing to the given stream, or null if support for the given mimetype
 *     is absent.
 */
AudioRecorder.getInstance = function getInstance(stream, mimetype) {

    // Use raw audio recorder if possible
    if (RawAudioRecorder.isSupportedType(mimetype))
        return new RawAudioRecorder(stream, mimetype);

    // No support for given mimetype
    return null;

};

/**
 * Implementation of AudioRecorder providing support for raw PCM
 * format audio. This recorder relies only on the Web Audio API and does not
 * require any browser-level support for its audio formats.
 *
 * @constructor
 * @augments AudioRecorder
 * @param {!OutputStream} stream
 *     The OutputStream to write audio data to.
 *
 * @param {!string} mimetype
 *     The mimetype of the audio data to send along the provided stream, which
 *     must be a "audio/L8" or "audio/L16" mimetype with necessary parameters,
 *     such as: "audio/L16;rate=44100,channels=2".
 */
function RawAudioRecorder(stream, mimetype) {

    /**
     * Reference to this RawAudioRecorder.
     *
     * @private
     * @type {!RawAudioRecorder}
     */
    var recorder = this;

    /**
     * The size of audio buffer to request from the Web Audio API when
     * recording or processing audio, in sample-frames. This must be a power of
     * two between 256 and 16384 inclusive, as required by
     * AudioContext.createScriptProcessor().
     *
     * @private
     * @constant
     * @type {!number}
     */
    var BUFFER_SIZE = 2048;

    /**
     * The window size to use when applying Lanczos interpolation, commonly
     * denoted by the variable "a".
     * See: https://en.wikipedia.org/wiki/Lanczos_resampling
     *
     * @private
     * @contant
     * @type {!number}
     */
    var LANCZOS_WINDOW_SIZE = 3;

    /**
     * The format of audio this recorder will encode.
     *
     * @private
     * @type {RawAudioFormat}
     */
    var format = RawAudioFormat.parse(mimetype);

    /**
     * An instance of a Web Audio API AudioContext object, or null if the
     * Web Audio API is not supported.
     *
     * @private
     * @type {AudioContext}
     */
    var context = AudioContextFactory.getAudioContext();

    // Some browsers do not implement navigator.mediaDevices - this
    // shims in this functionality to ensure code compatibility.
    if (!navigator.mediaDevices)
        navigator.mediaDevices = {};

    // Browsers that either do not implement navigator.mediaDevices
    // at all or do not implement it completely need the getUserMedia
    // method defined.  This shims in this function by detecting
    // one of the supported legacy methods.
    if (!navigator.mediaDevices.getUserMedia)
        navigator.mediaDevices.getUserMedia = (navigator.getUserMedia
                || navigator.webkitGetUserMedia
                || navigator.mozGetUserMedia
                || navigator.msGetUserMedia).bind(navigator);

    /**
     * ArrayBufferWriter wrapped around the audio output stream
     * provided when this RawAudioRecorder was created.
     *
     * @private
     * @type {!ArrayBufferWriter}
     */
    var writer = new ArrayBufferWriter(stream);

    /**
     * The type of typed array that will be used to represent each audio packet
     * internally. This will be either Int8Array or Int16Array, depending on
     * whether the raw audio format is 8-bit or 16-bit.
     *
     * @private
     * @constructor
     */
    var SampleArray = (format.bytesPerSample === 1) ? window.Int8Array : window.Int16Array;

    /**
     * The maximum absolute value of any sample within a raw audio packet sent
     * by this audio recorder. This depends only on the size of each sample,
     * and will be 128 for 8-bit audio and 32768 for 16-bit audio.
     *
     * @private
     * @type {!number}
     */
    var maxSampleValue = (format.bytesPerSample === 1) ? 128 : 32768;

    /**
     * The total number of audio samples read from the local audio input device
     * over the life of this audio recorder.
     *
     * @private
     * @type {!number}
     */
    var readSamples = 0;

    /**
     * The total number of audio samples written to the underlying Guacamole
     * connection over the life of this audio recorder.
     *
     * @private
     * @type {!number}
     */
    var writtenSamples = 0;

    /**
     * The audio stream provided by the browser, if allowed. If no stream has
     * yet been received, this will be null.
     *
     * @private
     * @type {MediaStream}
     */
    var mediaStream = null;

    /**
     * The source node providing access to the local audio input device.
     *
     * @private
     * @type {MediaStreamAudioSourceNode}
     */
    var source = null;

    /**
     * The script processing node which receives audio input from the media
     * stream source node as individual audio buffers.
     *
     * @private
     * @type {ScriptProcessorNode}
     */
    var processor = null;

    /**
     * The normalized sinc function. The normalized sinc function is defined as
     * 1 for x=0 and sin(PI * x) / (PI * x) for all other values of x.
     *
     * See: https://en.wikipedia.org/wiki/Sinc_function
     *
     * @private
     * @param {!number} x
     *     The point at which the normalized sinc function should be computed.
     *
     * @returns {!number}
     *     The value of the normalized sinc function at x.
     */
    var sinc = function sinc(x) {

        // The value of sinc(0) is defined as 1
        if (x === 0)
            return 1;

        // Otherwise, normlized sinc(x) is sin(PI * x) / (PI * x)
        var piX = Math.PI * x;
        return Math.sin(piX) / piX;

    };

    /**
     * Calculates the value of the Lanczos kernal at point x for a given window
     * size. See: https://en.wikipedia.org/wiki/Lanczos_resampling
     *
     * @private
     * @param {!number} x
     *     The point at which the value of the Lanczos kernel should be
     *     computed.
     *
     * @param {!number} a
     *     The window size to use for the Lanczos kernel.
     *
     * @returns {!number}
     *     The value of the Lanczos kernel at the given point for the given
     *     window size.
     */
    var lanczos = function lanczos(x, a) {

        // Lanczos is sinc(x) * sinc(x / a) for -a < x < a ...
        if (-a < x && x < a)
            return sinc(x) * sinc(x / a);

        // ... and 0 otherwise
        return 0;

    };

    /**
     * Determines the value of the waveform represented by the audio data at
     * the given location. If the value cannot be determined exactly as it does
     * not correspond to an exact sample within the audio data, the value will
     * be derived through interpolating nearby samples.
     *
     * @private
     * @param {!Float32Array} audioData
     *     An array of audio data, as returned by AudioBuffer.getChannelData().
     *
     * @param {!number} t
     *     The relative location within the waveform from which the value
     *     should be retrieved, represented as a floating point number between
     *     0 and 1 inclusive, where 0 represents the earliest point in time and
     *     1 represents the latest.
     *
     * @returns {!number}
     *     The value of the waveform at the given location.
     */
    var interpolateSample = function getValueAt(audioData, t) {

        // Convert [0, 1] range to [0, audioData.length - 1]
        var index = (audioData.length - 1) * t;

        // Determine the start and end points for the summation used by the
        // Lanczos interpolation algorithm (see: https://en.wikipedia.org/wiki/Lanczos_resampling)
        var start = Math.floor(index) - LANCZOS_WINDOW_SIZE + 1;
        var end = Math.floor(index) + LANCZOS_WINDOW_SIZE;

        // Calculate the value of the Lanczos interpolation function for the
        // required range
        var sum = 0;
        for (var i = start; i <= end; i++) {
            sum += (audioData[i] || 0) * lanczos(index - i, LANCZOS_WINDOW_SIZE);
        }

        return sum;

    };

    /**
     * Converts the given AudioBuffer into an audio packet, ready for streaming
     * along the underlying output stream. Unlike the raw audio packets used by
     * this audio recorder, AudioBuffers require floating point samples and are
     * split into isolated planes of channel-specific data.
     *
     * @private
     * @param {!AudioBuffer} audioBuffer
     *     The Web Audio API AudioBuffer that should be converted to a raw
     *     audio packet.
     *
     * @returns {!SampleArray}
     *     A new raw audio packet containing the audio data from the provided
     *     AudioBuffer.
     */
    var toSampleArray = function toSampleArray(audioBuffer) {

        // Track overall amount of data read
        var inSamples = audioBuffer.length;
        readSamples += inSamples;

        // Calculate the total number of samples that should be written as of
        // the audio data just received and adjust the size of the output
        // packet accordingly
        var expectedWrittenSamples = Math.round(readSamples * format.rate / audioBuffer.sampleRate);
        var outSamples = expectedWrittenSamples - writtenSamples;

        // Update number of samples written
        writtenSamples += outSamples;

        // Get array for raw PCM storage
        var data = new SampleArray(outSamples * format.channels);

        // Convert each channel
        for (var channel = 0; channel < format.channels; channel++) {

            var audioData = audioBuffer.getChannelData(channel);

            // Fill array with data from audio buffer channel
            var offset = channel;
            for (var i = 0; i < outSamples; i++) {
                data[offset] = interpolateSample(audioData, i / (outSamples - 1)) * maxSampleValue;
                offset += format.channels;
            }

        }

        return data;

    };

    /**
     * getUserMedia() callback which handles successful retrieval of an
     * audio stream (successful start of recording).
     *
     * @private
     * @param {!MediaStream} stream
     *     A MediaStream which provides access to audio data read from the
     *     user's local audio input device.
     */
    var streamReceived = function streamReceived(stream) {

        // Create processing node which receives appropriately-sized audio buffers
        processor = context.createScriptProcessor(BUFFER_SIZE, format.channels, format.channels);
        processor.connect(context.destination);

        // Send blobs when audio buffers are received
        processor.onaudioprocess = function processAudio(e) {
            writer.sendData(toSampleArray(e.inputBuffer).buffer);
        };

        // Connect processing node to user's audio input source
        source = context.createMediaStreamSource(stream);
        source.connect(processor);

        // Attempt to explicitly resume AudioContext, as it may be paused
        // by default
        if (context.state === 'suspended')
            context.resume();

        // Save stream for later cleanup
        mediaStream = stream;

    };

    /**
     * getUserMedia() callback which handles audio recording denial. The
     * underlying Guacamole output stream is closed, and the failure to
     * record is noted using onerror.
     *
     * @private
     */
    var streamDenied = function streamDenied() {

        // Simply end stream if audio access is not allowed
        writer.sendEnd();

        // Notify of closure
        if (recorder.onerror)
            recorder.onerror();

    };

    /**
     * Requests access to the user's microphone and begins capturing audio. All
     * received audio data is resampled as necessary and forwarded to the
     * Guacamole stream underlying this RawAudioRecorder. This
     * function must be invoked ONLY ONCE per instance of
     * RawAudioRecorder.
     *
     * @private
     */
    var beginAudioCapture = function beginAudioCapture() {

        // Attempt to retrieve an audio input stream from the browser
        var promise = navigator.mediaDevices.getUserMedia({
            'audio' : true
        }, streamReceived, streamDenied);

        // Handle stream creation/rejection via Promise for newer versions of
        // getUserMedia()
        if (promise && promise.then)
            promise.then(streamReceived, streamDenied);

    };

    /**
     * Stops capturing audio, if the capture has started, freeing all associated
     * resources. If the capture has not started, this function simply ends the
     * underlying Guacamole stream.
     *
     * @private
     */
    var stopAudioCapture = function stopAudioCapture() {

        // Disconnect media source node from script processor
        if (source)
            source.disconnect();

        // Disconnect associated script processor node
        if (processor)
            processor.disconnect();

        // Stop capture
        if (mediaStream) {
            var tracks = mediaStream.getTracks();
            for (var i = 0; i < tracks.length; i++)
                tracks[i].stop();
        }

        // Remove references to now-unneeded components
        processor = null;
        source = null;
        mediaStream = null;

        // End stream
        writer.sendEnd();

    };

    // Once audio stream is successfully open, request and begin reading audio
    writer.onack = function audioStreamAcknowledged(status) {

        // Begin capture if successful response and not yet started
        if (status.code === Status.Code.SUCCESS && !mediaStream)
            beginAudioCapture();

        // Otherwise stop capture and cease handling any further acks
        else {

            // Stop capturing audio
            stopAudioCapture();
            writer.onack = null;

            // Notify if stream has closed normally
            if (status.code === Status.Code.RESOURCE_CLOSED) {
                if (recorder.onclose)
                    recorder.onclose();
            }

            // Otherwise notify of closure due to error
            else {
                if (recorder.onerror)
                    recorder.onerror();
            }

        }

    };

};

RawAudioRecorder.prototype = new AudioRecorder();

/**
 * Determines whether the given mimetype is supported by
 * RawAudioRecorder.
 *
 * @param {!string} mimetype
 *     The mimetype to check.
 *
 * @returns {!boolean}
 *     true if the given mimetype is supported by RawAudioRecorder,
 *     false otherwise.
 */
RawAudioRecorder.isSupportedType = function isSupportedType(mimetype) {

    // No supported types if no Web Audio API
    if (!AudioContextFactory.getAudioContext())
        return false;

    return RawAudioFormat.parse(mimetype) !== null;

};

/**
 * Returns a list of all mimetypes supported by RawAudioRecorder. Only
 * the core mimetypes themselves will be listed. Any mimetype parameters, even
 * required ones, will not be included in the list. For example, "audio/L8" is
 * a raw audio mimetype that may be supported, but it is invalid without
 * additional parameters. Something like "audio/L8;rate=44100" would be valid,
 * however (see https://tools.ietf.org/html/rfc4856).
 *
 * @returns {!string[]}
 *     A list of all mimetypes supported by RawAudioRecorder,
 *     excluding any parameters. If the necessary JavaScript APIs for recording
 *     raw audio are absent, this list will be empty.
 */
RawAudioRecorder.getSupportedTypes = function getSupportedTypes() {

    // No supported types if no Web Audio API
    if (!AudioContextFactory.getAudioContext())
        return [];

    // We support 8-bit and 16-bit raw PCM
    return [
        'audio/L8',
        'audio/L16'
    ];

};

export { AudioRecorder, RawAudioRecorder }
