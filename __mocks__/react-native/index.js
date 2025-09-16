// Minimal mock of react-native for unit test environment
const React = require('react');

const NativeModules = require('./NativeModules');

function makeComponent(name) {
  return (props) => React.createElement(name, props, props && props.children);
}

const Modal = ({ children, ...props }) =>
  React.createElement('Modal', props, children);
const RNModal = Modal;
const TouchableOpacity = ({ children, ...props }) =>
  React.createElement('TouchableOpacity', props, children);
const View = makeComponent('View');
const Text = makeComponent('Text');
const Image = makeComponent('Image');
const ActivityIndicator = makeComponent('ActivityIndicator');

const FlatList = ({ data = [], renderItem, keyExtractor }) =>
  React.createElement(
    'FlatList',
    null,
    data.map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : `${index}`;
      const rendered = renderItem
        ? renderItem({ item, index })
        : React.createElement('View');
      if (React.isValidElement(rendered)) {
        return React.cloneElement(rendered, { key });
      }
      return React.createElement('View', { key });
    })
  );

const Alert = {
  alert: (title, message, buttons) => {
    // Call the first button's onPress for deterministic tests when provided with a single action
    if (
      Array.isArray(buttons) &&
      buttons.length > 0 &&
      typeof buttons[0].onPress === 'function'
    ) {
      buttons[0].onPress();
    }
  },
};

module.exports = {
  View,
  Text,
  Image,
  Modal,
  RNModal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  NativeModules,
  Platform: {
    OS: 'ios',
    select: (obj) => (obj.ios ? obj.ios : obj.default),
  },
  StyleSheet: {
    create: (styles) => styles,
    // flatten should merge arrays and objects to a single style object
    flatten: (style) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.map((s) => s || {}));
      }
      if (typeof style === 'object') return style;
      return {};
    },
  },
  // expose createElement for libraries that rely on it
  createElement: React.createElement,
};
