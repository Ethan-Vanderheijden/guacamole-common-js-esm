[![Tests](https://github.com/Ethan-Vanderheijden/guacamole-common-js-esm/actions/workflows/CI.yml/badge.svg)](https://github.com/Ethan-Vanderheijden/guacamole-common-js-esm/actions/workflows/CI.yml)

# guacamole-common-js ported to ESM

## What is guacamole-common-js?

guacamole-common-js is the core JavaScript library used by the Guacamole web
application.

guacamole-common-js provides an efficient tunnel for transporting
protocol data between JavaScript and the web application, as well as an
implementation of a Guacamole protocol client and abstract synchronized
drawing layers.

## Why does this fork exist?

By rewriting the library in ESM, guacamole-common-js becomes compatible with tree shaking and dynamic import statements, which can significantly reduce bundle size.

[padarom/guacamole-common-js](https://github.com/padarom/guacamole-common-js) is also a fork of guacamole-common-js published via npm, but they combine all the files into one namespace, making it incompatible with tree shaking.


## Installation

```
npm install --save guacamole-common-js-esm
```

## Usage
```js
import { Client, Mouse, Keyboard } from 'guacamole-common-js';
```

Read the [documentation](https://guacamole.apache.org/doc/guacamole-common-js/) for a list of every class you can import. Imports correspond one-to-one with the original guacamole-common-js, but you no longer need to preface them with `Guacamole.` namespace. It is recommended that you use a bundler with tree shaking support, such as [Rollup](https://rollupjs.org/) or [Webpack](https://webpack.js.org/).

## Version numbers
I intend to keep the npm version numbers identical to each release of guacamole. If I screw something up and need to release a patch, I will add a letter designating the patch (e.g. `1.0.0-b`).

## Reporting problems

_I am not a maintainer or contributor to the original guacamole repository. I only created this fork and published it to npm._

Please report any bugs encountered by opening a new ticket on Jira:

    https://issues.apache.org/jira/projects/GUACAMOLE

Any bugs or questions to this fork specifically can be asked via issues on GitHub.
