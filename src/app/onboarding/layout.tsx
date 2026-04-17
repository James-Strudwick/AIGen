import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get started — FomoForms',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
