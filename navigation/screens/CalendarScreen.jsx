import * as React from 'react';
import { View, Text} from 'react-native';
import EventList from '../../Components/EventList.tsx';

export default function CalendarScreen({navigation}){
    return(
        <View style={{ flex: 1, justifyContent: 'center'}}>
            <EventList />
        </View>
    );
}
