if (typeof module === 'undefined') {
  var module = { exports: window }
}

module.exports.$ = function $ (q) {
  return document.querySelector(q)
}

module.exports.$$ = function $$ (q) {
  return document.querySelectorAll(q)
}

module.exports.$render = function $render (q, c) {
  return $(q).appendChild(c.render ? c.render() : c)
}

module.exports.H = function H (cons, meta, children) {
  if (typeof cons === 'object' && cons !== null) {
    children = meta
    meta = cons
    cons = null
  }

  if (Array.isArray(cons)) {
    children = cons
    cons = null
  }

  if (Array.isArray(meta)) {
    children = meta
    meta = {}
  }

  var tag, id, classes = []
  if (cons) {
    cons.match(/([\.#]?)([\w\d-]+)/g).forEach(p => {
      if (p.startsWith('.')) { classes.push(p.slice(1))
      } else if (p.startsWith('#')) {
        id = p.slice(1)
      } else {
        tag = p
      }
    })
  }

  var node = document.createElement(tag || 'div')

  if (classes.length) node.setAttribute('class', classes.join(' '))
  if (id) node.setAttribute('id', id)
  if (meta) {
    Object.keys(meta).forEach(key => {
      if (key === 'disabled') {
        node.disabled = meta[key]
      } else if (key === 'style') {
        Object.keys(meta.style).forEach(prop => node.style[prop] = meta.style[prop])
      } else {
        node.setAttribute(key, meta[key])
      }
    })
  }

  if (children) children.forEach(child => typeof child === 'string' ? node.innerHTML += child : node.appendChild(child.render ? child.render() : child))
  if (componentHandler) componentHandler.upgradeElement(node)

  return node
}

module.exports.Component = function Component (renderFunc) {
  return function (state, children) {
    return {
      DOMNode: undefined,
      state: Object.assign(state, children),
      setState: function (newState) {
        Object.assign(this.state, newState)
        this.render()
      },
      render: function () {
        var newNode = renderFunc(this.state)
        if (this.DOMNode) this.DOMNode.parentNode.replaceChild(newNode, this.DOMNode)
        return this.DOMNode = newNode
      }
    }
  }
}
