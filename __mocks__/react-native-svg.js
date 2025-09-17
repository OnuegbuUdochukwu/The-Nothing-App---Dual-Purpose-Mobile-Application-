const React = require('react');
const { View } = require('react-native');

const Svg = (props) => React.createElement(View, props, props.children);
const Path = (props) => React.createElement(View, props, props.children);
const G = (props) => React.createElement(View, props, props.children);

module.exports = {
  Svg,
  Path,
  G,
  // default export for ESM-style imports
  default: Svg,
};
