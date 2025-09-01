import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";

interface NotFoundProps {
  message?: string;
  title?: string;
  showBackButton?: boolean;
}

export const NotFound = ({ 
  message = "The page you're looking for doesn't exist.", 
  title = "404 - Page Not Found",
  showBackButton = true,
  children 
}: PropsWithChildren<NotFoundProps>) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        </div>
        
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
        
        {showBackButton && (
          <div className="mt-8 space-y-4">
            <button
              onClick={handleGoBack}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        )}
      </div>
    </div>
  );
};