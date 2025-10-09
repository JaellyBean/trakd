'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { joinGroup } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  code: z.string().min(6, { message: 'Invite code must be at least 6 characters.' }),
});

export function JoinGroupForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not authenticated',
            description: 'You must be signed in to join a group.',
        });
        return;
    }

    setIsLoading(true);
    const result = await joinGroup(values.code, user.uid);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: `You've joined the group.`,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not join group',
        description: result.error,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter invite code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Join Group
        </Button>
      </form>
    </Form>
  );
}
