const assert = require('assert')
const EventEmitter = require('events')
const proxyquire = require('proxyquire')

// create reader with serialport stub
const Reader = proxyquire('./index.js', { 'serialport': EventEmitter })

describe('Reader', () => {
  describe('#on("data")', () => {
    it('should provide a message', (done) => {
      const reader = new Reader({ port: '/dev/ttyUSB0' })
      const serialStub = reader._port

      reader.on('data', (msg) => {
        assert.equal(msg.temperature, 24.4, 'temperature')
        assert.equal(msg.humidity, 52, 'humidity')
        assert.equal(msg.sensorId, 2, 'sensorId')
        assert.equal(msg.newBattery, true, 'newBattery')
        assert.equal(msg.weakBattery, false, 'weakBattery')
        done()
      })

      serialStub.emit('data', '\n[LaCrosseITPlusReader.10.1q (RFM69 f:868300 r:17241)]\r\nOK 9 2 129 4 220 52\r\n')
    })
  })
})
