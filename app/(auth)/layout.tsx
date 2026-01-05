
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area adapts to screen size */}
      <main className="flex-grow flex items-center justify-center">
        <div className="
          w-full
          sm:max-w-md   /* Small screens: up to 28rem (~448px) */
          md:max-w-lg   /* Medium screens: up to 32rem (~512px) */
          lg:max-w-2xl  /* Large screens: up to 42rem (~672px) */
          xl:max-w-3xl  /* Extra large: up to 48rem (~768px) */
          2xl:max-w-4xl /* 2XL: up to 56rem (~896px) */
          mx-auto
          px-2 sm:px-4 md:px-8
          w-full
        ">
          {children}
        </div>
      </main>
    </div>
  );
}

