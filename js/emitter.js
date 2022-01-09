export function EventEmitter () {
  this.events = {}
}

EventEmitter.prototype.on = function (event, callback) {
  this.events[event] = this.events[event] || []
  this.events[event].push(callback)

  return () => {
    this.events[event] = this.events[event].filter(eventFn => callback !== eventFn)
  }
}

EventEmitter.prototype.emit = function (event, ...rest) {
  if (event in this.events) {
    this.events[event].forEach(e => {
      e(...rest)
    })
  }
}