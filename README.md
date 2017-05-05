# godot-haproxy

[![Greenkeeper badge](https://badges.greenkeeper.io/numbat-metrics/numbat-haproxy.svg)](https://greenkeeper.io/)
HAProxy producer for Godot.

## Installation

```bash
npm install godot-haproxy
```

## Usage
```js
var godot = require('godot');
var HAProxyProducer = require('godot-haproxy');

godot.createClient({
  type: 'tcp',
  producers: [
    HAProxyProducer({
      ttl: 1000
    })
  ]
}).connect(1337);
```
