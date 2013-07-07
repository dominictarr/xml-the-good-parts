#! /usr/bin/env node

var split = require('split')
var through = require('through')
var JSONStream = require('JSONStream')
var combine = require('stream-combiner')
//current item can be an array, or a object,
//or a key.

function tokenizer () {
  return split(/(<\/?[\w\d-_]+>)/)
}

function parser () {

  var path = [], stack = []
  return through(function (data) {
    var m = /^<(\/?)([\w\d-_]+)>$/.exec(data)
    var last
    if(m) {
      if(!m[1]) {
        path.unshift(m[2])
        var node = {tag: m[2], children: []}
        if(stack.length)
          stack[0].children.push(node)
        stack.unshift(node)
      }
      else if((last = path.shift()) != m[2]) {
        console.log(last)
        throw new Error('expected:'+ last)
      } else {
        var last = stack.shift()
        if(!stack.length)
          this.queue(last)
      }
    }
      else if(!/^\s*$/.test(data)) {
        stack[0].children.push(data)
      }
  })
}

function jsonizer () {
  function compact (item, parent) {
    var tag = null
    if(item.children.length == 1 
      && 'string' == typeof item.children[0]) {
      var val = item.children[0]
      return !isNaN(val) ? parseFloat(val) : val

    }
    else if(item.children.every (function (item) {
      if(tag === null)
        return tag = item.tag
      return tag === item.tag
    })) {
      return item.children.map(compact)
    } else {
      var o = {}
      item.children.forEach(function (v, k) {
        o[v.tag] = compact(v)
      })
      return o
    }
  }
  
  return through(function (data) {
    this.queue(compact(data))
  })
}

var exports = module.exports = 

function XMLtoJSON () {
  return combine(tokenizer(), parser(), jsonizer())
}

exports.tokenizer = tokenizer
exports.parser    = parser
exports.jsonizer   = jsonizer

if(!module.parent) {
  process.stdin
    .pipe(exports())
    .pipe(JSONStream.stringify())
    .pipe(process.stdout)
}
