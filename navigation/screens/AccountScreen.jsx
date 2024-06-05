import * as React from 'react';
import { View, StyleSheet , Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountList from '../../Components/AccountList.tsx';
import IconButton from '../../Components/IconButton.tsx';

export default function AccountScreen({ navigation, route }) {
    const logout = async () => {
        console.log('Eseguendo il logout');
        try {
            await AsyncStorage.removeItem('@email');
            console.log('Email rimossa con successo');

            navigation.navigate('Home');
        } catch (error) {
            console.error('Logout fallito', error);
        }
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <View  style={styles.containerButton}>
                <IconButton iconName='exit-outline' iconColor={'#D9D9D9'} onPress={logout} iconSize={40}></IconButton>
            </View>
            <AccountList />
        </View>
    );
}

const styles = StyleSheet.create({
    containerButton: {
      paddingLeft: 12,
      flexDirection: 'row',
      height: '100%',
      backgroundColor: '#050d25', // Viola estremamente scuro
    },
});