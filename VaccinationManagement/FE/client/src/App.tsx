import AuthProvider from "./contexts/auth/Authcontext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyRouterProvider from "./router";
import 'semantic-ui-css/semantic.min.css';
const queryClient = new QueryClient();
export default function App() {
  return (
      <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <MyRouterProvider />
      </QueryClientProvider>
      </AuthProvider>
  );
}
