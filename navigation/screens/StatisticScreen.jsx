import * as React from 'react';
import { View, Text } from 'react-native';
import Statistiche from '../../Components/Statistiche.tsx';

export default function StatisticScreen({navigation}){
    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Statistiche />
        </View>
    );
}