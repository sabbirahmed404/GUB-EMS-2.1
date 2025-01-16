import { useState } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import { SignupModal } from '../../components/auth/SignupModal';
import { RoleSwitch } from '../../components/auth/RoleSwitch';
import { useAuth } from '../../contexts/AuthContext';

export const TestAuthPage = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { user, profile, error, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
                  {user ? 'Authentication Status' : 'Test Authentication'}
                </h2>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-4">
                    {error}
                  </div>
                )}
                {user && (
                  <>
                    <p className="text-sm text-gray-600">Email: {user.email}</p>
                    {profile && <p className="text-sm text-gray-600">Role: {profile.role}</p>}
                  </>
                )}
                <div className="space-x-4">
                  {user ? (
                    <>
                      <RoleSwitch />
                      <button
                        onClick={() => signOut()}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsSignupOpen(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {!user && <LoginForm />}
          <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
        </div>
      </div>
    </div>
  );
}; 