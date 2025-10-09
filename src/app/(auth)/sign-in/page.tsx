import { SignInForm } from '@/components/auth/sign-in-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <SignInForm />
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
