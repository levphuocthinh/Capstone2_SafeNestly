// Mock authentication system for testing
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'guest';
  avatar?: string;
}

// Auth state management
let currentUser: User | null = null;

// Test accounts for login
const TEST_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'tenant@test.com': {
    password: 'password123',
    user: {
      id: '1',
      email: 'tenant@test.com',
      name: 'Sarah Johnson',
      role: 'tenant',
      avatar: 'https://via.placeholder.com/80x80'
    }
  },
  'landlord@test.com': {
    password: 'password123',
    user: {
      id: '2',
      email: 'landlord@test.com',
      name: 'Mike Thompson',
      role: 'landlord',
      avatar: 'https://via.placeholder.com/80x80'
    }
  },
  'guest@test.com': {
    password: 'password123',
    user: {
      id: '3',
      email: 'guest@test.com',
      name: 'Alex Guest',
      role: 'guest',
      avatar: 'https://via.placeholder.com/80x80'
    }
  }
};

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const authenticateUser = async (email: string, password: string): Promise<LoginResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const account = TEST_ACCOUNTS[email.toLowerCase()];
  
  if (!account) {
    return {
      success: false,
      error: 'Account not found. Please check your email address.'
    };
  }
  
  if (account.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.'
    };
  }

  // Set current user
  currentUser = account.user;
  
  return {
    success: true,
    user: account.user
  };
};

export const logoutUser = async (): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clear current user
  currentUser = null;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

export const getHomeRouteForRole = (role: string): string => {
  switch (role) {
    case 'tenant':
      return '/(tenant)/home';
    case 'landlord':
      return '/(landlord)/dashboard';
    case 'guest':
      return '/(guest)/home';
    default:
      return '/(tenant)/home';
  }
};

// Get test account credentials for display
export const getTestAccounts = () => {
  return [
    {
      email: 'tenant@test.com',
      password: 'password123',
      role: 'tenant',
      name: 'Sarah Johnson',
      description: 'Full access to tenant features including roommate matching'
    },
    {
      email: 'landlord@test.com', 
      password: 'password123',
      role: 'landlord',
      name: 'Mike Thompson',
      description: 'Property management and tenant interaction features'
    },
    {
      email: 'guest@test.com',
      password: 'password123', 
      role: 'guest',
      name: 'Alex Guest',
      description: 'Limited access - basic browsing with registration prompts'
    }
  ];
};