import * as React from 'react';
import { View, Text} from 'react-native';
import EventController from '../../Components/EventController.tsx';

export default function EventControllerScreen({navigation}){
    return(
        <View style={{ flex: 1, justifyContent: 'center'}}>

            <EventController />
        </View>
    );
}