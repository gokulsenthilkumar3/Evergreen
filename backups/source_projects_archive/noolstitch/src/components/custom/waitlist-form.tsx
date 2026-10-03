// @polsia:user-owned — bilingual waitlist signup form.
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { apiFetch } from '@/lib/api-client';
import { WaitlistSignupCreate, WaitlistSignupItem } from '@/lib/contracts/waitlist';
import { notoSansTamil } from '@/lib/fonts';

type WaitlistSignupCreateType = z.input<typeof WaitlistSignupCreate>;

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { applyServerErrors } from '@/lib/forms';
import { LocaleToggle, useLocale, useT } from './locale-toggle';

const ROLES = ['mill', 'trader', 'factory', 'brand'] as const;

export function WaitlistSection() {
  return (
    <div
      className={`${notoSansTamil.variable}`}
      style={{ fontFamily: 'var(--font-noto-tamil, inherit)' }}
    >
      <WaitlistContent />
    </div>
  );
}

function WaitlistContent() {
  const t = useT();
  const [locale] = useLocale();
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<WaitlistSignupCreateType>({
    resolver: zodResolver(WaitlistSignupCreate),
    defaultValues: { name: '', role: undefined, whatsapp: '', email: '', locale: 'en' },
  });

  React.useEffect(() => {
    form.setValue('locale', locale);
  }, [locale, form]);

  async function onSubmit(values: WaitlistSignupCreateType) {
    try {
      await apiFetch('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify(values),
        schema: WaitlistSignupItem,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const cause = err instanceof Error ? (err.cause as unknown) : undefined;
      const body = cause as Record<string, unknown> | null | undefined;
      if (body && typeof body === 'object' && 'error' in body) {
        const msg = String(body.error);
        if (msg.includes('already on waitlist') || msg.includes('Unique constraint')) {
          toast.error(t('waitlist.error.duplicate'));
          return;
        }
      }
      const applied = body ? applyServerErrors(body, form.setError) : false;
      if (!applied) {
        toast.error(t('waitlist.error.generic'));
      }
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <CheckCircle className="h-12 w-12 text-primary" />
        <h3 className="font-display text-h3 text-foreground">{t('waitlist.success.title')}</h3>
        <p className="max-w-md text-body text-muted-foreground">{t('waitlist.success.body')}</p>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-8">
      {/* Header row with locale toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-lg">
          <p className="text-eyebrow">{t('waitlist.section.eyebrow')}</p>
          <h2 className="mt-2 font-display text-h2 text-foreground">
            {t('waitlist.section.title')}
          </h2>
          <p className="mt-3 text-body text-muted-foreground">{t('waitlist.section.body')}</p>
        </div>
        <LocaleToggle className="mt-1 self-start" />
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('waitlist.form.name.label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('waitlist.form.name.placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* WhatsApp */}
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('waitlist.form.whatsapp.label')}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={t('waitlist.form.whatsapp.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('waitlist.form.email.label')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('waitlist.form.email.placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t('waitlist.form.role.label')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                  >
                    {ROLES.map((role) => (
                      <div key={role} className="flex items-center">
                        <RadioGroupItem value={role} id={`role-${role}`} className="sr-only" />
                        <Label
                          htmlFor={`role-${role}`}
                          className={`flex w-full cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-small font-medium transition-colors ${
                            field.value === role
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          }`}
                        >
                          {t(
                            `waitlist.form.role.${role}` as Parameters<ReturnType<typeof useT>>[0],
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? t('waitlist.form.submitting') : t('waitlist.form.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
