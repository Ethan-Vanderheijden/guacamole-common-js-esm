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

/**
 * An input stream abstraction used by the Guacamole client to facilitate
 * transfer of files or other binary data.
 * 
 * @constructor
 * @param {!Client} client
 *     The client owning this stream.
 *
 * @param {!number} index
 *     The index of this stream.
 */
export function InputStream(client, index) {

    /**
     * Reference to this stream.
     *
     * @private
     * @type {!InputStream}
     */
    var guac_stream = this;

    /**
     * The index of this stream.
     *
     * @type {!number}
     */
    this.index = index;

    /**
     * Called when a blob of data is received.
     * 
     * @event
     * @param {!string} data
     *     The received base64 data.
     */
    this.onblob = null;

    /**
     * Called when this stream is closed.
     * 
     * @event
     */
    this.onend = null;

    /**
     * Acknowledges the receipt of a blob.
     * 
     * @param {!string} message
     *     A human-readable message describing the error or status.
     *
     * @param {!number} code
     *     The error code, if any, or 0 for success.
     */
    this.sendAck = function(message, code) {
        client.sendAck(guac_stream.index, message, code);
    };

};
