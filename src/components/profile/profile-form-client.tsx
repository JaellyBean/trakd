'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { updateUserProfile } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters.' }),
  email: z.string().email(),
  photoURL: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormClientProps {
  profile: ProfileFormValues;
}

export function ProfileFormClient({ profile }: ProfileFormClientProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: profile,
  });

  const photoUrlValue = form.watch('photoURL');

  const getAvatarFallback = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated' });
      return;
    }
    setIsLoading(true);
    const result = await updateUserProfile(user.uid, values);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={photoUrlValue} alt={form.getValues('displayName')} />
                    <AvatarFallback className="text-3xl">{getAvatarFallback(form.getValues('displayName'))}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <FormControl>
                        <Input placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
                    <FormDescription>
                        Enter the URL of your profile image.
                    </FormDescription>
                    <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} disabled />
              </FormControl>
              <FormDescription>
                Your email address cannot be changed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}
