import assert from 'node:assert';
import test from 'node:test';

test('ArrayBufferReader', async (t) => {
    const ArrayBufferReader = await import('../src/ArrayBufferReader.js');
    assert(ArrayBufferReader.ArrayBufferReader instanceof Function);
});

test('ArrayBufferWriter', async (t) => {
    const ArrayBufferWriter = await import('../src/ArrayBufferWriter.js');
    assert(ArrayBufferWriter.ArrayBufferWriter instanceof Function);
    assert.strictEqual(typeof ArrayBufferWriter.DEFAULT_BLOB_LENGTH, 'number');
});

test('AudioContextFactory', async (t) => {
    const AudioContextFactory = await import('../src/AudioContextFactory.js');
    assert('singleton' in AudioContextFactory.AudioContextFactory);
    assert('getAudioContext' in AudioContextFactory.AudioContextFactory);
});

test('AudioPlayer', async (t) => {
    const AudioPlayer = await import('../src/AudioPlayer.js');
    assert(AudioPlayer.AudioPlayer instanceof Function);
    assert(AudioPlayer.AudioPlayer.isSupportedType instanceof Function);
    assert(AudioPlayer.AudioPlayer.getSupportedTypes instanceof Function);
    assert(AudioPlayer.AudioPlayer.getInstance instanceof Function);
    assert(AudioPlayer.RawAudioPlayer instanceof Function);
    assert(AudioPlayer.RawAudioPlayer.isSupportedType instanceof Function);
    assert(AudioPlayer.RawAudioPlayer.getSupportedTypes instanceof Function);
    assert(AudioPlayer.RawAudioPlayer.prototype instanceof AudioPlayer.AudioPlayer);
});

test('AudioRecorder', async (t) => {
    const AudioRecorder = await import('../src/AudioRecorder.js');
    assert(AudioRecorder.AudioRecorder instanceof Function);
    assert(AudioRecorder.AudioRecorder.isSupportedType instanceof Function);
    assert(AudioRecorder.AudioRecorder.getSupportedTypes instanceof Function);
    assert(AudioRecorder.AudioRecorder.getInstance instanceof Function);
    assert(AudioRecorder.RawAudioRecorder instanceof Function);
    assert(AudioRecorder.RawAudioRecorder.isSupportedType instanceof Function);
    assert(AudioRecorder.RawAudioRecorder.getSupportedTypes instanceof Function);
    assert(AudioRecorder.RawAudioRecorder.prototype instanceof AudioRecorder.AudioRecorder);
});

test('BlobReader', async (t) => {
    const BlobReader = await import('../src/BlobReader.js');
    assert(BlobReader.BlobReader instanceof Function);
});

test('BlobWriter', async (t) => {
    const BlobWriter = await import('../src/BlobWriter.js');
    assert(BlobWriter.BlobWriter instanceof Function);
});

test('Client', async (t) => {
    const Client = await import('../src/Client.js');
    assert(Client.Client instanceof Function);
    assert.strictEqual(Client.Client.State.constructor, Object);
    assert.strictEqual(Client.Client.DefaultTransferFunction.constructor, Object);
    assert.strictEqual(Client.Client.Message.constructor, Object);
})

test('DataURIReader', async (t) => {
    const DataURIReader = await import('../src/DataURIReader.js');
    assert(DataURIReader.DataURIReader instanceof Function);
});

test('Display', async (t) => {
    const Display = await import('../src/Display.js');
    assert(Display.Display instanceof Function);
    assert(Display.Display.VisibleLayer instanceof Function);
    assert(Display.Display.Statistics instanceof Function);
});

test('Event', async (t) => {
    const Event = await import('../src/Event.js');
    assert(Event.Event instanceof Function);
    assert(Event.Event.DOMEvent instanceof Function);
    assert(Event.Event.DOMEvent.cancelEvent instanceof Function);
    assert(Event.Event.Target instanceof Function);
});

test('InputSink', async (t) => {
    const InputSink = await import('../src/InputSink.js');
    assert(InputSink.InputSink instanceof Function);
});

test('InputStream', async (t) => {
    const InputStream = await import('../src/InputStream.js');
    assert(InputStream.InputStream instanceof Function);
});

test('IntegerPool', async (t) => {
    const IntegerPool = await import('../src/IntegerPool.js');
    assert(IntegerPool.IntegerPool instanceof Function);
});

test('JSONReader', async (t) => {
    const JSONReader = await import('../src/JSONReader.js');
    assert(JSONReader.JSONReader instanceof Function);
});

test('Keyboard', async (t) => {
    const Keyboard = await import('../src/Keyboard.js');
    assert(Keyboard.Keyboard instanceof Function);
    assert(Keyboard.Keyboard.ModifierState instanceof Function);
    assert(Keyboard.Keyboard.ModifierState.fromKeyboardEvent instanceof Function);
});

test('KeyEventInterpreter', async (t) => {
    const KeyEventInterpreter = await import('../src/KeyEventInterpreter.js');
    assert(KeyEventInterpreter.KeyEventInterpreter instanceof Function);
    assert(KeyEventInterpreter.KeyEventInterpreter.KeyDefinition instanceof Function);
    assert(KeyEventInterpreter.KeyEventInterpreter.KeyEvent instanceof Function);
});

test('Layer', async (t) => {
    const Layer = await import('../src/Layer.js');
    assert(Layer.Layer instanceof Function);
    assert(Layer.Layer.Pixel instanceof Function);
    const masks = ['ROUT', 'ATOP', 'XOR', 'ROVER', 'OVER', 'PLUS', 'RIN', 'IN', 'OUT', 'RATOP', 'SRC'];
    for(const mask of masks) {
        assert(mask in Layer.Layer);
    }
});

test('Mouse', async (t) => {
    const Mouse = await import('../src/Mouse.js');
    assert(Mouse.Mouse instanceof Function);
    assert(Mouse.Mouse.State instanceof Function);
    assert.strictEqual(Mouse.Mouse.State.Buttons.constructor, Object);
    assert(Mouse.Mouse.Event instanceof Function);
    assert(Mouse.Mouse.Event.Target instanceof Function);
    assert(Mouse.Mouse.Touchpad instanceof Function);
    assert(Mouse.Mouse.Touchscreen instanceof Function);
});

test('Object', async (t) => {
    const Object = await import('../src/Object.js');
    assert(Object.Object instanceof Function);
    assert.strictEqual(typeof Object.Object.ROOT_STREAM, 'string');
    assert.strictEqual(typeof Object.Object.STREAM_INDEX_MIMETYPE, 'string');
});

test('OnScreenKeyboard', async (t) => {
    const OnScreenKeyboard = await import('../src/OnScreenKeyboard.js');
    assert(OnScreenKeyboard.OnScreenKeyboard instanceof Function);
    assert(OnScreenKeyboard.OnScreenKeyboard.Layout instanceof Function);
    assert(OnScreenKeyboard.OnScreenKeyboard.Key instanceof Function);
});

test('OutputStream', async (t) => {
    const OutputStream = await import('../src/OutputStream.js');
    assert(OutputStream.OutputStream instanceof Function);
});

test('Parser', async (t) => {
    const Parser = await import('../src/Parser.js');
    assert(Parser.Parser instanceof Function);
    assert(Parser.Parser.codePointCount instanceof Function);
    assert(Parser.Parser.toInstruction instanceof Function);
});

test('Position', async (t) => {
    const Position = await import('../src/Position.js');
    assert(Position.Position instanceof Function);
    assert(Position.Position.fromClientPosition instanceof Function);
});

test('RawAudioFormat', async (t) => {
    const RawAudioFormat = await import('../src/RawAudioFormat.js');
    assert(RawAudioFormat.RawAudioFormat instanceof Function);
    assert(RawAudioFormat.RawAudioFormat.parse instanceof Function);
});

test('SessionRecording', async (t) => {
    const SessionRecording = await import('../src/SessionRecording.js');
    assert(SessionRecording.SessionRecording instanceof Function);
});

test('Status', async (t) => {
    const Status = await import('../src/Status.js');
    assert(Status.Status instanceof Function);
    assert.strictEqual(Status.Status.Code.constructor, Object);
    assert(Status.Status.Code.fromHTTPCode instanceof Function);
    assert(Status.Status.Code.fromWebSocketCode instanceof Function);
});

test('StringReader', async (t) => {
    const StringReader = await import('../src/StringReader.js');
    assert(StringReader.StringReader instanceof Function);
});

test('StringWriter', async (t) => {
    const StringWriter = await import('../src/StringWriter.js');
    assert(StringWriter.StringWriter instanceof Function);
});

test('Touch', async (t) => {
    const Touch = await import('../src/Touch.js');
    assert(Touch.Touch instanceof Function);
    assert(Touch.Touch.State instanceof Function);
    assert(Touch.Touch.Event instanceof Function);
});

test('Tunnel', async (t) => {
    const Tunnel = await import('../src/Tunnel.js');
    assert(Tunnel.Tunnel instanceof Function);
    assert.strictEqual(typeof Tunnel.Tunnel.INTERNAL_DATA_OPCODE, 'string');
    assert.strictEqual(Tunnel.Tunnel.State.constructor, Object);
    assert(Tunnel.HTTPTunnel instanceof Function);
    assert(Tunnel.HTTPTunnel.prototype instanceof Tunnel.Tunnel);
    assert(Tunnel.WebSocketTunnel instanceof Function);
    assert(Tunnel.WebSocketTunnel.prototype instanceof Tunnel.Tunnel);
    assert(Tunnel.ChainedTunnel instanceof Function);
    assert(Tunnel.ChainedTunnel.prototype instanceof Tunnel.Tunnel);
    assert(Tunnel.StaticHTTPTunnel instanceof Function);
    assert(Tunnel.StaticHTTPTunnel.prototype instanceof Tunnel.Tunnel);
});

test('UTF8Parser', async (t) => {
    const UTF8Parser = await import('../src/UTF8Parser.js');
    assert(UTF8Parser.UTF8Parser instanceof Function);
});

test('Version', async (t) => {
    const version = await import('../src/Version.js');
    assert.strictEqual(typeof version.API_VERSION, 'string');
});

test('VideoPlayer', async (t) => {
    const VideoPlayer = await import('../src/VideoPlayer.js');
    assert(VideoPlayer.VideoPlayer instanceof Function);
    assert(VideoPlayer.VideoPlayer.isSupportedType instanceof Function);
    assert(VideoPlayer.VideoPlayer.getSupportedTypes instanceof Function);
    assert(VideoPlayer.VideoPlayer.getInstance instanceof Function);
});
