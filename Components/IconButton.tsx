import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

//Vengono definiti i props del IconButton.
interface IconButtonProps {
  onPress: () => void; //Viene proposta la possibilità di definire un metodo con trigger 'onPress'.
  iconName: string; //Nome dell'icona
  iconSize?: number; //Grandezza dell'icona.
  iconColor?: string; //Colore dell'icona.
  buttonStyle: ViewStyle; //Stile dell'icona.
}

//Definizione del componente.
const IconButton: React.FC<IconButtonProps> = ({ onPress, iconName, iconSize = 30, iconColor = '#000', buttonStyle }) => {
  
  //Costruzione del componente.
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
