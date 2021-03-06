const EventEmitter = require('events')
const SerialPort = require('serialport')
const Hoek = require('hoek')

const defaultOptions = {
  port: '/dev/ttyUSB0',
  portOptions: {
    baudrate: 57600,
    databits: 8,
    stopbits: 1,
    parity: 'none',
    buffersize: 1028
  },
  pattern: /OK 9 ([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)/,
  maxChunkSize: 4096,
  autoStart: true
}

class Reader extends EventEmitter {
  constructor (options) {
    super()
    this.options = Hoek.applyToDefaults(defaultOptions, options || {})

    if (!this.options.portOptions.parser) {
      this.options.portOptions.parser = SerialPort.parsers.readline('\r\n')
    }

    if (this.options.autoStart) this.start()
  }

  start () {
    this._port = new SerialPort(this.options.port, this.options.portOptions)
    this._port.on('data', this._onData.bind(this))
    this._port.on('error', this._onError.bind(this))
  }

  stop () {
    this._port.stop()
  }

  _onData (data) {
    // OK 9 49 1   4   182 54     ID = 49  T: 20.6  H: 54  no NewBatt
    // OK 9 55 129 4   192 56     ID = 55  T: 21.6  H: 56  WITH NewBatt 
    // OK 9 ID XXX XXX XXX XXX
    // |  | |  |   |   |   |
    // |  | |  |   |   |   --- Humidity incl. WeakBatteryFlag ???
    // |  | |  |   |   |------ Temp * 10 + 1000 LSB
    // |  | |  |   |---------- Temp * 10 + 1000 MSB
    // |  | |  |-------------- Sensor type (1 or 2) +128 if NewBatteryFlag
    // |  | |----------------- Sensor ID
    // |  |------------------- fix "9"
    // |---------------------- fix "OK"

    const match = data.match(this.options.pattern)
    if (match) {
      const type = parseInt(match[2])
      const temperature = (parseInt(match[3]) * 256 + parseInt(match[4]) - 1000) / 10
      const humidity = parseInt(match[5])

      var message = {
        sensorId: parseInt(match[1]),
        sensorType: type % 128,
        temperature: temperature,
        humidity: humidity % 128,
        newBattery: type > 128,
        weakBattery: humidity > 128,
        raw: data
      }

      this._lastMessage = message
      this.emit('data', message)
    }
  }

  _onError (error) {
    this.emit('error', error)
  }
}

module.exports = Reader
