import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Products: undefined;
  ProductDetails: { productId: number };
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  Addresses: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: number };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminOrders: undefined;
  AdminShops: undefined;
  AdminAnalytics: undefined;
  AdminUsers: undefined;
  AdminShopDetails: { shopId: number };
  AdminOrderDetails: { orderId: number };
  AdminUserDetails: { userId: number };
}; 