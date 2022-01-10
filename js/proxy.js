function GetRepositoryAPI (repository) {
  this.insert = function (data) {}
  this.find = function (params, { order } = {}) {}
  this.findOne = function (params) {}
  this.updateOne = function (params, data) {}
  this.deleteOne = function (params) {}
}

export function GetRepositoryProxy (repository) {
  this.api = new GetRepositoryAPI(repository)
  this.cache = []

  this.insert = function (data) {
    this.api.insert(data)
  }
  this.find = function (params, { order } = {}) {
    const network = this.api.find()
    if (!this.cache[repository] || this.cache[repository] !== network) {
      this.cache[repository] = network
    }

    return this.cache[repository]
  }
  this.findOne = function (params) {
    this.api.findOne(params)
  }
  this.updateOne = function (params, data) {
    this.api.updateOne(params, data)
  }
  this.deleteOne = function (params) {
    this.api.deleteOne(params)
  }
}