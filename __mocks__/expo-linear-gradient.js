const React = require('react');
const { View } = require('react-native');
module.exports = {
  LinearGradient: (props) => React.createElement(View, props, props.children),
};
