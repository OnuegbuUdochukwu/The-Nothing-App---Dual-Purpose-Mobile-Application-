const React = require('react');
const { View } = require('react-native');

// A proxy that returns a simple component for any requested icon
function makeIcon(name) {
  const Icon = (props) => React.createElement(View, props, props.children);
  Icon.displayName = `Icon(${name})`;
  return Icon;
}

// Create a handler that returns the same stub for any property access
const handler = {
  get(target, prop) {
    if (prop === 'default') return makeIcon('default');
    return makeIcon(String(prop));
  },
};

module.exports = new Proxy({}, handler);
