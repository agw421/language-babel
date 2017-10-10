/*global atom*/
const {CompositeDisposable} = require('atom');

module.exports = {
  // add grammar watchers
  watchGrammars() {
    this.subscriptions = new CompositeDisposable(
      atom.grammars.onDidAddGrammar(this.patchGrammar.bind(this)),
      atom.grammars.onDidUpdateGrammar(this.patchGrammar.bind(this))
    );
    this.allGrammars(); // catch all grammars added before this package started.
  },

  stopWatchGrammars() {
    this.subscriptions.dispose();
  },

  allGrammars() {
    atom.grammars.grammars.forEach((val, idx, arr) =>
      this.patchGrammar(arr[idx])
    );
  },

  patchGrammar(grammar) {
    if (this.shouldPatchGrammar(grammar)) {
      // traverse the patterns and repository grammar objects
      traverse(grammar.rawRepository);
      traverse(grammar.rawPatterns);
    }
  },

  shouldPatchGrammar(grammar) {
    const config = atom.config.get('language-babel.patchGrammars');
    return isArray(config)
      ? config.some(element => element === grammar.packageName)
      : false;
  }

};

function traverse(x) {
  isArray(x) ? traverseArray(x) : isObject(x) ? traverseObject(x) : null;
}

function isObject(o) {
  return typeof o === 'object' && o !== null;
}

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function traverseArray(arr) {
  arr.forEach(function(x) {
    traverse(x);
  });
}

function traverseObject(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      // if this is a include for language-javascript then patch it
      key === 'include' && obj[key] === 'source.js'
        ? (obj[key] = 'source.js.jsx')
        : traverse(obj[key]);
    }
  }
}
