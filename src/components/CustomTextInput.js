import React, { Component } from "react";
import { TextInput } from "react-native";

export class CustomTextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      borderColor: false,
      borderWidth: false,
    };
  }

  onFocus = () => {
    this.setState({ borderColor: true, borderWidth: true });
  };

  onBlur = () => {
    this.setState({ borderColor: false, borderWidth: false });
  };

  render() {
    return (
      <TextInput
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        keyboardType={this.props.keyboardType}
        maxLength={this.props.maxLength}
        onChangeText={this.props.onChangeText}
        placeholder={this.props.placeholder}
        autoCapitalize={this.props.autoCapitalize}
        autoCompleteType={this.props.autoCompleteType}
        autoCorrect={this.props.autoCorrect}
        secureTextEntry={this.props.secureTextEntry}
        style={{
          width: this.props.width,
          height: this.props.height,
          paddingLeft: this.props.paddingLeft,
          borderRadius: 12,
          borderWidth: this.state.borderWidth ? 2 : 1,
          borderColor: this.state.borderColor ? "black" : "#D5D5D5",
          fontSize: 16,
          fontWeight: "bold",
        }}
        textAlign={this.props.textAlign}
        defaultValue={this.props.defaultValue}
      />
    );
  }
}

export default CustomTextInput;
