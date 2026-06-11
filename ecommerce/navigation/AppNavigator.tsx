import React, { useState, useCallback } from 'react';
import { NavigationIndependentTree, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme/colors';
import { dbService } from '../database/DatabaseService';
import { User } from '../database/types';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ShopHome from '../screens/shop/ShopHome';
import ProductDetail from '../screens/shop/ProductDetail';
import Cart from '../screens/cart/Cart';
import Checkout from '../screens/cart/Checkout';
import Profile from '../screens/user/Profile';
import EditProfile from '../screens/user/EditProfile';
import OrderHistory from '../screens/user/OrderHistory';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminCategories from '../screens/admin/AdminCategories';
import AdminProducts from '../screens/admin/AdminProducts';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminOrders from '../screens/admin/AdminOrders';
import AdminCoupons from '../screens/admin/AdminCoupons';
import UserCoupons from '../screens/user/UserCoupons';

const Stack = createNativeStackNavigator();
const T1 = createBottomTabNavigator();
const T2 = createBottomTabNavigator();
const T3 = createBottomTabNavigator();

const tabOpts = {
  headerShown: false,
  tabBarStyle: { backgroundColor: C.white, borderTopColor: C.border, borderTopWidth: 1, paddingBottom: 8, paddingTop: 8, height: 60 },
  tabBarActiveTintColor: C.primary,
  tabBarInactiveTintColor: C.tabInactive,
  tabBarLabelStyle: { fontSize: 12, fontWeight: '600' as const, marginBottom: 2 },
};

function PublicTabs() {
  return (
    <T1.Navigator screenOptions={tabOpts}>
      <T1.Screen name="ShopHome" component={ShopHome} options={{ title: 'Trang chủ', tabBarIcon: ({ color, size }: any) => <Ionicons name="home" size={size} color={color} /> }} />
      <T1.Screen name="Cart" component={Cart} options={{ title: 'Giỏ hàng', tabBarIcon: ({ color, size }: any) => <Ionicons name="cart" size={size} color={color} /> }} />
      <T1.Screen name="Login" component={Login} options={{ title: 'Đăng nhập', tabBarIcon: ({ color, size }: any) => <Ionicons name="log-in" size={size} color={color} /> }} />
      <T1.Screen name="Register" component={Register} options={{ title: 'Đăng ký', tabBarIcon: ({ color, size }: any) => <Ionicons name="person-add" size={size} color={color} /> }} />
    </T1.Navigator>
  );
}

function UserTabs() {
  return (
    <T2.Navigator screenOptions={tabOpts}>
      <T2.Screen name="ShopHome" component={ShopHome} options={{ title: 'Trang chủ', tabBarIcon: ({ color, size }: any) => <Ionicons name="home" size={size} color={color} /> }} />
      <T2.Screen name="Cart" component={Cart} options={{ title: 'Giỏ hàng', tabBarIcon: ({ color, size }: any) => <Ionicons name="cart" size={size} color={color} /> }} />
      <T2.Screen name="Profile" component={Profile} options={{ title: 'Cá nhân', tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
    </T2.Navigator>
  );
}

function AdminTabs() {
  return (
    <T3.Navigator screenOptions={tabOpts}>
      <T3.Screen name="ShopHome" component={ShopHome} options={{ title: 'Trang chủ', tabBarIcon: ({ color, size }: any) => <Ionicons name="home" size={size} color={color} /> }} />
      <T3.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Quản trị', tabBarIcon: ({ color, size }: any) => <Ionicons name="settings" size={size} color={color} /> }} />
      <T3.Screen name="Cart" component={Cart} options={{ title: 'Giỏ hàng', tabBarIcon: ({ color, size }: any) => <Ionicons name="cart" size={size} color={color} /> }} />
      <T3.Screen name="Profile" component={Profile} options={{ title: 'Cá nhân', tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
    </T3.Navigator>
  );
}



function MainTabs() {
  const [user, setUser] = useState<User | null>(dbService.getCurrentUser());
  useFocusEffect(useCallback(() => {
    setUser(dbService.getCurrentUser());
  }, []));

  if (!user) return <PublicTabs />;
  if (user.role === 'Admin') return <AdminTabs />;
  return <UserTabs />;
}

const commonOpts = {
  headerStyle: { backgroundColor: C.white },
  headerTintColor: C.text,
  headerTitleStyle: { fontWeight: 'bold' as const },
  contentStyle: { backgroundColor: C.bg },
};

export default function AppNavigator() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator screenOptions={commonOpts}>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Chi tiết sản phẩm' }} />
        <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Thanh toán' }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Chỉnh sửa hồ sơ' }} />
        <Stack.Screen name="OrderHistory" component={OrderHistory} options={{ title: 'Lịch sử đơn hàng' }} />
        <Stack.Screen name="AdminCategories" component={AdminCategories} options={{ title: 'Quản lý danh mục' }} />
        <Stack.Screen name="AdminProducts" component={AdminProducts} options={{ title: 'Quản lý sản phẩm' }} />
        <Stack.Screen name="AdminUsers" component={AdminUsers} options={{ title: 'Quản lý người dùng' }} />
        <Stack.Screen name="AdminOrders" component={AdminOrders} options={{ title: 'Quản lý đơn hàng' }} />
        <Stack.Screen name="AdminCoupons" component={AdminCoupons} options={{ title: 'Quản lý coupon' }} />
        <Stack.Screen name="UserCoupons" component={UserCoupons} options={{ title: 'Voucher của tôi' }} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}
