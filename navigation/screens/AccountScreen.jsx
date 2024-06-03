import * as React from 'react';
import { View, Text } from 'react-native';
import AccountList from '../../Components/AccountList.tsx';


export default function AccountScreen({navigation}){
    return(
        <View style={{ flex: 1, justifyContent: 'center'}}>
            <AccountList/>
        </View>
    );
}