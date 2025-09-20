import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to authentication by default for better user experience
  // Users can access guest mode from the login screen or create accounts
  return <Redirect href="/(auth)/login" />;
}
