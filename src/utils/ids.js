/**
 * Create a new id generator / cache instance.
 * You may optionally provide a seed that is used internally.
 * @param {Seed} seed
 */
class Ids {
  constructor(seed) {
    if (!(this instanceof Ids)) {
      return new Ids(seed)
    }
    seed = seed || [128, 36, 1]
    this._seed = seed.length ? this.rack(seed[0], seed[1], seed[2]) : seed
  }

  createId(bits = 128, base = 16) {
    if (bits <= 0) return '0'

    let digits = Math.log(Math.pow(2, bits)) / Math.log(base)
    for (let i = 2; digits === Infinity; i *= 2) {
      digits = (Math.log(Math.pow(2, bits / i)) / Math.log(base)) * i
    }

    let rem = digits - Math.floor(digits)

    let res = ''

    for (let i = 0; i < Math.floor(digits); i++) {
      let x = Math.floor(Math.random() * base).toString(base)
      res = x + res
    }

    if (rem) {
      let b = Math.pow(base, rem)
      let x = Math.floor(Math.random() * b).toString(base)
      res = x + res
    }

    let parsed = parseInt(res, base)
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
      return this.createId(bits, base)
    } else return res
  }

  rack(bits, base, expandBy) {
    const fn = function(data) {
      let iters = 0
      let id
      do {
        if (iters++ > 10) {
          if (expandBy) bits += expandBy
          else throw new Error('too many ID collisions, use more bits')
        }

        id = this.createId(bits, base)
      } while (Object.hasOwnProperty.call(hats, id))

      hats[id] = data
      return id
    }
    const hats = (fn.hats = {})

    fn.get = function(id) {
      return fn.hats[id]
    }

    fn.set = function(id, value) {
      fn.hats[id] = value
      return fn
    }

    fn.bits = bits || 128
    fn.base = base || 16
    return fn
  }

  /**
   * Generate a next id.
   * @param {Object} [element] element to bind the id to
   * @return {String} id
   */
  next(element) {
    return this._seed(element || true)
  }

  /**
   * Generate a next id with a given prefix.
   * @param {Object} [element] element to bind the id to
   * @return {String} id
   */
  nextPrefixed(prefix, element) {
    let id

    do {
      id = prefix + this.next(true)
    } while (this.assigned(id))

    // claim {prefix}{random}
    this.claim(id, element)

    // return
    return id
  }

  /**
   * Manually claim an existing id.
   * @param {String} id
   * @param {String} [element] element the id is claimed by
   */
  claim(id, element) {
    this._seed.set(id, element || true)
  }

  /**
   * Returns true if the given id has already been assigned.
   * @param  {String} id
   * @return {Boolean}
   */
  assigned(id) {
    return this._seed.get(id) || false
  }

  /**
   * Unclaim an id.
   * @param  {String} id the id to unclaim
   */
  unclaim(id) {
    delete this._seed.hats[id]
  }

  /**
   * Clear all claimed ids.
   */
  clear() {
    const hats = this._seed.hats
    for (let id in hats) {
      this.unclaim(id)
    }
  }
}

export default Ids
