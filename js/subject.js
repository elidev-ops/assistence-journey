export function Subject () {
  this.state = []
}

Subject.prototype.subscribe = function (fn) {
  this.state.push(fn)
}

Subject.prototype.unsubscribe = function (fnToRemove) {
  this.state = this.state.filter(fn => fn !== fnToRemove)
} 

Subject.prototype.publisher = function (key, data) {
  for (const observer of this.state) {
    if (observer.key === key) {
      observer.action(data)
    }
  }
} 