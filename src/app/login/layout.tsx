import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in — FomoForms',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
