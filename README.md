# extendable-media-recorder

**An extendable drop-in replacement for the native MediaRecorder.**

[![dependencies](https://img.shields.io/david/chrisguttandin/extendable-media-recorder.svg?style=flat-square)](https://github.com/chrisguttandin/extendable-media-recorder/network/dependencies)
[![version](https://img.shields.io/npm/v/extendable-media-recorder.svg?style=flat-square)](https://www.npmjs.com/package/extendable-media-recorder)

This package provides (a part of) the MediaRecorder API as defined by the [MediaStream Recording](https://w3c.github.io/mediacapture-record) specification. If possible it will use the native implementation which is available in Chrome and Firefox.

In addition this package also allows to define custom encoders. Those encoders can be used to render files which are not supported by any browser so far. This does currently only work for audio encoders.

## Usage

`extendable-media-recorder` is available on [npm](https://www.npmjs.com/package/extendable-media-recorder) and can be installed as usual.

```shell
npm install extendable-media-recorder
```

It exports the `MediaRecorder` constructor. It can be used like the native implementation. The following example will use the default encoder that is defined by the browser.

```js
import { MediaRecorder } from 'extendable-media-recorder';

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
```

`extendable-media-recorder` also exports a `register()` function which can be used to define custom encoders. One predefined encoder is available as the [`extendable-media-recorder-wav-encoder` package](https://github.com/chrisguttandin/extendable-media-recorder-wav-encoder). It can be used as shown here.

```js
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });
```

## Inner Workings

Internally two different techniques are used to enable custom encoders. In Chrome the native MediaRecorder is used to encode the stream as webm file with pcm encoded audio. Then a minimal version of [ts-ebml](https://github.com/legokichi/ts-ebml) is used to parse that pcm data to pass it on to the encoder. In other browsers the Web Audio API is used to get the pcm data of the recorded audio.
