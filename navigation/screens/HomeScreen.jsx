import * as React from 'react';
import { View, Text } from 'react-native';
import HomeEventList from '../../Components/HomeEventList';

export default function HomeScreen({navigation}){
    return(
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <HomeEventList />
        </View>
    );
}