import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings — FomoForms',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
