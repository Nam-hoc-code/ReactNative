import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { dbService } from '../ecommerce/database/DatabaseService';
import EcommerceApp from '../ecommerce/navigation/AppNavigator';

export default function Entry() {
  useEffect(() => { dbService.initDatabase(); }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <EcommerceApp />
    </SafeAreaView>
  );
}
