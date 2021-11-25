let _base = ''
let _hash = false

function routes (path, callback) {
  let route = {
    path: path,
    keys: []
  }
  route.regexp = regexp(path, route.keys)
  routes.callbacks.push(middleware(route, callback))
}

routes.callbacks = []

routes.go = function (path) {
  let context = new Context(path)
  context.saveState()
  let i = 0
  function callNextCallback () {
    const callback = routes.callbacks[i++]
    if (!callback) {
      return console.log(`route [${context.path}] not found`)
    }
    callback(context, callNextCallback)
  }
  callNextCallback()
}

routes.run = function (opts) {
  _base = opts && opts.base ? opts.base : ''
  _hash = opts && opts.hash ? '#!' : false

  let url = location.pathname + location.search + location.hash
  url = _base ? url.replace(_base, '') : ''
  if (_hash && ~location.hash.indexOf('#!')) {
    url = location.hash.substr(2) + location.search
  }
  routes.go(url)
}


function Context (path) {
  path = _base + (_hash ? '/#!' : '') + path.replace(_base, '')
  path = path.length > 1 ? path.replace(/\/$/, '') : path
  this.fullPath = path
  path = _hash ? path.split('#!')[1] : (_base ? path.replace(_base, '') : path)
  this.title = document.title
  this.params = {}
  let h = path.split('#')
  path = h[0]
  this.hash = h[1] || ''
  let q = path.split('?')
  path = q[0]
  this.queryString = q[1] || ''
  this.path = path || '/'
}

Context.prototype.saveState = function () {
  history.replaceState(this.state, this.title, this.fullPath)
}

function middleware (route, callback) {
  return function (context, next) {
    const match = route.regexp.exec(decodeURIComponent(context.path))
    if (match) {
      fillParams(match, route.keys, context.params)
      return callback(context)
    }
    next()
  }
}

function fillParams (match, keys, params) {
  const len = match.length
  let idx = 0
  let key, val

  while (++idx < len) {
    key = keys[idx - 1]
    val = match[idx]
    if (val !== undefined) {
      params[key.name] = val
    }
  }
}

function regexp (path, keys) {
  let regex = path.replace(/\/(:?)([^\/?]+)(\??)(?=\/|$)/g,
    function (match, isVariable, segment, isOptional) {
      if (isVariable) keys.push({ name: segment })
      return isVariable ? isOptional ? '(?:\\/([^\\/]+))?' : '\\/([^\\/]+)' : '\\/' + segment
    })
    regex = regex === '*' ? '(.*)' : (regex === '/' ? '' : regex)
    if (keys.length === 0) keys.push({ name: 0 })
    return new RegExp('^' + regex + '(?:\\/(?=$))?$', 'i')
}