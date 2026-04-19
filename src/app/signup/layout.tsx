import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up — FomoForms',
  description:
    'Create your free FomoForms account. Set up a branded AI-powered fitness timeline for your coaching business in minutes.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
