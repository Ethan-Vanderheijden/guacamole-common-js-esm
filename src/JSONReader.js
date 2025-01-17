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

import { StringReader } from './StringReader.js';

/**
 * A reader which automatically handles the given input stream, assembling all
 * received blobs into a JavaScript object by appending them to each other, in
 * order, and decoding the result as JSON. Note that this object will overwrite
 * any installed event handlers on the given InputStream.
 * 
 * @constructor
 * @param {InputStream} stream
 *     The stream that JSON will be read from.
 */
export function JSONReader(stream) {

    /**
     * Reference to this JSONReader.
     *
     * @private
     * @type {!JSONReader}
     */
    var guacReader = this;

    /**
     * Wrapped StringReader.
     *
     * @private
     * @type {!StringReader}
     */
    var stringReader = new StringReader(stream);

    /**
     * All JSON read thus far.
     *
     * @private
     * @type {!string}
     */
    var json = '';

    /**
     * Returns the current length of this JSONReader, in characters.
     *
     * @return {!number}
     *     The current length of this JSONReader.
     */
    this.getLength = function getLength() {
        return json.length;
    };

    /**
     * Returns the contents of this JSONReader as a JavaScript
     * object.
     *
     * @return {object}
     *     The contents of this JSONReader, as parsed from the JSON
     *     contents of the input stream.
     */
    this.getJSON = function getJSON() {
        return JSON.parse(json);
    };

    // Append all received text
    stringReader.ontext = function ontext(text) {

        // Append received text
        json += text;

        // Call handler, if present
        if (guacReader.onprogress)
            guacReader.onprogress(text.length);

    };

    // Simply call onend when end received
    stringReader.onend = function onend() {
        if (guacReader.onend)
            guacReader.onend();
    };

    /**
     * Fired once for every blob of data received.
     * 
     * @event
     * @param {!number} length
     *     The number of characters received.
     */
    this.onprogress = null;

    /**
     * Fired once this stream is finished and no further data will be written.
     *
     * @event
     */
    this.onend = null;

};
