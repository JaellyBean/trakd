import { SignUpForm } from '@/components/auth/sign-up-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
