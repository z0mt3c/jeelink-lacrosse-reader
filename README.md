# jeelink-lacrosse-reader
[![Build Status](https://travis-ci.org/z0mt3c/jeelink-lacrosse-reader.svg?branch=master)](https://travis-ci.org/z0mt3c/jeelink-lacrosse-reader)

## Usage

```
new Reader({ port: '/dev/cu.usbserial-AI04NSUW' }).on('data', (msg) => console.log('0:', msg))
```

## Default options

```
const defaultOptions = {
  port: '/dev/ttyUSB0',
  portOptions: {
    baudrate: 57600,
    databits: 8,
    stopbits: 1,
    parity: 'none',
    buffersize: 2048,
    parser: SerialPort.parsers.raw
  },
  pattern: /OK 9 ([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)/,
  maxChunkSize: 4096,
  autoStart: true
}
```