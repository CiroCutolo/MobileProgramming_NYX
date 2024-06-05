import * as React from 'react';
import { View, Text } from 'react-native';
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
            <IconButton iconName='exit-outline' onPress={logout}></IconButton>
            <AccountList />
        </View>
    );
}
