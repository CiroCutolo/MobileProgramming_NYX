import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, TouchableOpacity } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AccountScreen from './screens/AccountScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticScreen from './screens/StatisticScreen';
import Popup from './screens/Popup';
import Registrazione from './screens/Registrazione';
import EventControllerScreen from './screens/EventControllerScreen';

const homeName = 'Home';
const accountName = 'Account';
const calendarName = 'Eventi';
const statisticName = 'Statistiche';
const addEventName = 'Aggiungi';


const Tab = createBottomTabNavigator();

export default function MainContainer() {
    const [modalVisible, setModalVisible] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const apriPopup = () => {
        setModalVisible(true);
    };

    const chiudiPopup = () => {
        setModalVisible(false);
    };

    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName={homeName}
                screenOptions={({ route, navigation }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        let rn = route.name;

                        if (rn === homeName) {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (rn === accountName) {
                            iconName = focused ? 'person' : 'person-outline';
                        } else if (rn === calendarName) {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (rn === statisticName) {
                            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                        } else if (rn === addEventName) {
                            iconName = focused ? 'add-circle' : 'add-circle-outline';
                            return <Ionicons name={iconName} size={35} color={'#D9D9D9'} />;
                        }

                        return <Ionicons name={iconName} size={28} color={'#D9D9D9'} />;
                    },
                    headerTitleStyle: { color: '#d9d9d9' },
                    headerStyle: {
                        backgroundColor: '#050d25',
                        shadowColor: '#FFFFFF', // Colore bianco per l'ombreggiatura
                        shadowOffset: { width: 0, height: 8 }, // Ombreggiatura solo in basso
                        shadowOpacity: 0.8,
                        shadowRadius: 5, // Aumenta il raggio per un'ombreggiatura più morbida
                        elevation: 5,
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate(homeName)}>
                            <Image
                                source={require('./logo.png')}
                                style={{ width: 50, height: 50, marginRight: 15 }} />
                        </TouchableOpacity>
                    ),
                    tabBarActiveTintColor: '#660066',
                    tabBarInactiveTintColor: '#d9d9d9',
                    tabBarStyle: {
                        backgroundColor: '#050d25',
                    },
                    tabBarHideOnKeyboard: true, 
                })}
            >
                <Tab.Screen name={homeName} component={HomeScreen} />
                <Tab.Screen name={statisticName} component={StatisticScreen} />
                <Tab.Screen name={addEventName} component={EventControllerScreen} />
                <Tab.Screen name={calendarName} component={CalendarScreen} />
                <Tab.Screen
                    name={accountName}
                    component={AccountScreen}
                    listeners={{
                        tabPress: (e) => {
                            if (!isAuthenticated) {
                                e.preventDefault();
                                apriPopup();
                            }
                        },
                    }}
                />
                <Tab.Screen name="Registrazione" component={Registrazione} options={{ tabBarButton: () => null }} />
                <Tab.Screen name="EventController" component={EventControllerScreen} options={{ tabBarButton: () => null }}/>
            </Tab.Navigator>
            <Popup 
                modalVisible={modalVisible} 
                chiudiPopup={chiudiPopup} 
                setIsAuthenticated={setIsAuthenticated}
            />
        </NavigationContainer>
    );
}
