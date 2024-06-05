import * as React from 'react';
import { View, StyleSheet , Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountList from '../../Components/AccountList.tsx';
import IconButton from '../../Components/IconButton.tsx';

export default function AccountScreen({ navigation, route }) {

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <AccountList />
        </View>
    );
}
