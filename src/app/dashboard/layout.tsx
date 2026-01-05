import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header userEmail={user.email} />

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
