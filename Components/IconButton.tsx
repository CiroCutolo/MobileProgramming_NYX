import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


interface IconButtonProps {
  onPress: () => void;
  iconName: string;
  iconSize?: number;
  iconColor?: string;
  buttonStyle: ViewStyle;
}

const IconButton: React.FC<IconButtonProps> = ({ onPress, iconName, iconSize = 30, iconColor = '#000', buttonStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      <Icon name={iconName} size={iconSize} color={iconColor}  />
    </TouchableOpacity>
  );  
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 10,
  },
});

export default IconButton;
