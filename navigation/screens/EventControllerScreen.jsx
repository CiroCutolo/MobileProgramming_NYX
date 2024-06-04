import * as React from 'react';
import { View, Text} from 'react-native';
import EventController from '../../Components/EventController.tsx';

export default function EventControllerScreen({route, navigation}){
    const {evento} = route.params ? route.params.evento : {evento:null};

    return(
        <View style={{ flex: 1, justifyContent: 'center'}}>

            <EventController evento={evento} />
        </View>
    );
}