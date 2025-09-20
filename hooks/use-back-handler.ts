import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { router, usePathname } from 'expo-router';

// Define routes where back button should exit the app
const EXIT_ROUTES = [
  '/(tenant)/home',
  '/(landlord)/dashboard', 
  '/(guest)/home',
  '/(auth)/login'
];

// Define routes where back button should go to specific pages
const CUSTOM_BACK_ROUTES: Record<string, string> = {
  '/(auth)/register': '/(auth)/login',
  '/(auth)/phone-login': '/(auth)/login',
  '/(auth)/onboarding': '/(auth)/register',
  '/(tenant)/favorites': '/(tenant)/home',
  '/(tenant)/roommate-matching': '/(tenant)/home',
  '/(tenant)/profile': '/(tenant)/home',
  '/(landlord)/create-listing': '/(landlord)/dashboard',
  '/(landlord)/contacts': '/(landlord)/dashboard',
};

export const useBackHandler = () => {
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      // If on main screens, show exit confirmation
      if (EXIT_ROUTES.includes(pathname)) {
        Alert.alert(
          "Exit App", 
          "Are you sure you want to exit SafeNestly?",
          [
            {
              text: "Cancel",
              onPress: () => null,
              style: "cancel"
            },
            { 
              text: "Exit", 
              onPress: () => BackHandler.exitApp() 
            }
          ]
        );
        return true; // Prevent default behavior
      }

      // Handle custom back navigation
      if (CUSTOM_BACK_ROUTES[pathname]) {
        router.push(CUSTOM_BACK_ROUTES[pathname] as any);
        return true; // Prevent default behavior
      }

      // For all other routes, use default router back
      if (router.canGoBack()) {
        router.back();
        return true; // Prevent default behavior
      }

      // If can't go back, navigate to appropriate home
      if (pathname.startsWith('/(tenant)')) {
        router.replace('/(tenant)/home');
      } else if (pathname.startsWith('/(landlord)')) {
        router.replace('/(landlord)/dashboard');
      } else if (pathname.startsWith('/(guest)')) {
        router.replace('/(guest)/home');
      } else {
        router.replace('/(auth)/login');
      }
      
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [pathname]);
};