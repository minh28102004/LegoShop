'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/common/components/ui/Button';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { cn } from '@/common/utils/cn';
import { useI18n } from '@/lib/i18n/useI18n';
import LanguageSwitcher from '@/modules/admin/components/LanguageSwitcher';
import BannerCarousel from '@/modules/auth/components/BannerCarousel';
import { login } from '@/modules/auth/services/authApi';
import { setAccessToken } from '@/modules/auth/services/authStorage';

const LegoScene = dynamic(() => import('@/components/LegoScene'), {
  ssr: false,
  loading: () => (
    <div className='absolute inset-0 bg-[linear-gradient(130deg,rgba(246,248,252,0.9),rgba(247,250,255,0.7)),radial-gradient(circle_at_22%_18%,rgba(77,163,255,0.22),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(245,197,66,0.18),transparent_38%)]' />
  ),
});

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const shellVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
};

const leftPanelVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const rightPanelVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const formCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: smoothEase,
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: smoothEase },
  },
};

type LoginFieldProps = {
  autoComplete: string;
  icon: ReactNode;
  id: string;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onInvalid: (event: FormEvent<HTMLInputElement>) => void;
  rightAction?: ReactNode;
  type: string;
  value: string;
};

function LoginField({
  autoComplete,
  icon,
  id,
  label,
  onChange,
  onInvalid,
  rightAction,
  type,
  value,
}: LoginFieldProps) {
  return (
    <label className='block' htmlFor={id}>
      <span className='mb-2 block text-sm font-semibold text-slate-700'>{label}</span>
      <div className='group relative rounded-[14px] border border-[var(--admin-border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[border-color,box-shadow] duration-75 ease-out hover:border-[var(--admin-border-strong)] focus-within:border-[var(--admin-primary)] focus-within:shadow-[var(--admin-focus-ring)]'>
        <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-75 group-focus-within:text-[#2F91D0]'>
          {icon}
        </span>
        <input
          required
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={label}
          value={value}
          onChange={onChange}
          onInvalid={onInvalid}
          className={cn(
            'h-11 w-full rounded-[14px] bg-transparent pl-12 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus-visible:ring-0 sm:text-base',
            rightAction ? 'pr-12' : 'pr-4',
          )}
        />
        {rightAction ? (
          <span className='absolute right-3 top-1/2 -translate-y-1/2'>{rightAction}</span>
        ) : null}
      </div>
    </label>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const motionEnabled = !shouldReduceMotion;
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorPulse, setErrorPulse] = useState(0);

  function handleInvalidField(event: FormEvent<HTMLInputElement>) {
    event.preventDefault();
    setErrorPulse((current) => current + 1);
    toast.error(event.currentTarget.validationMessage, {
      id: 'admin-login-validation',
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.dismiss('admin-login-error');
    toast.dismiss('admin-login-validation');
    setLoading(true);

    try {
      const response = await login({ email, password });
      setAccessToken(response.accessToken);
      router.replace(ADMIN_ROUTES.dashboard);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.loginFailed');
      setErrorPulse((current) => current + 1);
      toast.error(message, { id: 'admin-login-error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='relative isolate min-h-screen overflow-hidden bg-[#F6F8FC] text-slate-950'>
      <div className='pointer-events-none absolute inset-0 -z-30'>
        <LegoScene />
      </div>
      <div className='pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(115deg,rgba(246,248,252,0.86)_0%,rgba(247,250,255,0.62)_46%,rgba(246,248,252,0.84)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),transparent)]' />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(77,163,255,0.1),transparent_38%,rgba(245,197,66,0.09)_68%,transparent)] opacity-40'
      />

      <section className='mx-auto flex min-h-screen w-full max-w-[1180px] items-center px-4 py-6 sm:px-6 lg:px-6'>
        <motion.div
          variants={shellVariants}
          initial={motionEnabled ? 'hidden' : false}
          animate='show'
          className='relative grid w-full overflow-hidden rounded-[24px] border border-white/70 bg-white/46 shadow-[0_34px_110px_-58px_rgba(15,23,42,0.56)] backdrop-blur-lg lg:min-h-[660px] lg:grid-cols-[minmax(0,0.98fr)_minmax(392px,0.9fr)] xl:rounded-[28px]'
        >
          <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(255,255,255,0.2)_42%,rgba(255,255,255,0.48))]' />
          <div className='pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)]' />

          <motion.div
            variants={leftPanelVariants}
            initial={motionEnabled ? 'hidden' : false}
            animate='show'
            className='relative flex min-h-[500px] flex-col justify-center gap-6 overflow-hidden px-5 py-6 sm:px-7 sm:py-7 lg:min-h-0 lg:px-8 lg:py-8 xl:px-9'
          >
            <div className='w-full max-w-[500px]'>
              <div className='relative rounded-[22px] border border-white/72 bg-white/50 p-2.5 shadow-[0_20px_58px_-44px_rgba(15,23,42,0.54)] backdrop-blur-lg'>
                <div className='grid min-h-[218px] grid-cols-12 grid-rows-[101px_101px] gap-2.5 sm:min-h-[238px] sm:grid-rows-[111px_111px]'>
                  <div className='relative col-span-7 row-span-2 overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_12px_28px_-24px_rgba(15,23,42,0.42)]'>
                    <Image
                      src='/login-lego-shop-banner.png'
                      alt='Figure Lab Lego minifigure shop showcase'
                      width={1920}
                      height={768}
                      priority
                      sizes='(min-width: 1024px) 340px, 60vw'
                      className='h-full w-full object-cover object-center'
                    />
                    <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.14))]' />
                  </div>

                  <div className='relative col-span-5 overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38)]'>
                    <Image
                      src='/login-template-birthday.png'
                      alt='Birthday figure template preview'
                      width={1000}
                      height={1000}
                      sizes='(min-width: 1024px) 150px, 40vw'
                      className='h-full w-full object-cover object-[50%_34%]'
                    />
                  </div>

                  <div className='relative col-span-5 grid grid-cols-2 gap-2.5'>
                    <div className='relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38)]'>
                      <Image
                        src='/login-template-graduation-b.png'
                        alt='Graduation frame template preview'
                        width={1000}
                        height={1000}
                        sizes='(min-width: 1024px) 72px, 20vw'
                        className='h-full w-full object-cover object-[50%_26%]'
                      />
                    </div>
                    <div className='relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_10px_24px_-22px_rgba(15,23,42,0.38)]'>
                      <Image
                        src='/login-template-valentine.png'
                        alt='Valentine figure template preview'
                        width={1000}
                        height={1000}
                        sizes='(min-width: 1024px) 72px, 20vw'
                        className='h-full w-full object-cover object-[58%_30%]'
                      />
                    </div>
                  </div>
                </div>

                <div className='pointer-events-none absolute -bottom-3 left-9 h-11 w-24 rounded-2xl border border-white/70 bg-white/58 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.46)] backdrop-blur-md' />
                <div className='pointer-events-none absolute -right-2 top-8 h-14 w-12 rotate-6 rounded-2xl border border-white/70 bg-[#F5C542]/66 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.46)] backdrop-blur-md' />
              </div>
            </div>

            <BannerCarousel />
          </motion.div>

          <motion.div
            variants={rightPanelVariants}
            initial={motionEnabled ? 'hidden' : false}
            animate='show'
            className='relative border-t border-white/64 bg-white/28 px-5 py-6 sm:px-7 sm:py-7 lg:border-l lg:border-t-0 lg:px-7 lg:py-8 xl:px-8'
          >
            <div className='mx-auto flex h-full w-full max-w-[420px] flex-col justify-center'>
              <motion.div
                variants={formItemVariants}
                className='mb-5 flex items-center justify-between gap-4'
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <span className='grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_-20px_rgba(15,23,42,0.48)] ring-1 ring-white/80'>
                    <Image
                      src='/figure-lab-logo.png'
                      alt='Figure Lab'
                      width={48}
                      height={48}
                      className='h-full w-full object-cover'
                      priority
                    />
                  </span>
                  <div className='min-w-0'>
                    <p className='truncate pb-0.5 text-2xl font-bold leading-[1.2] text-slate-950'>
                      Figure Lab
                    </p>
                  </div>
                </div>
                <LanguageSwitcher className='shrink-0' />
              </motion.div>

              <motion.div
                animate={
                  errorPulse > 0 && motionEnabled
                    ? { x: [0, -4, 4, -3, 3, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.34, ease: 'easeInOut' }}
              >
                <motion.form
                  onSubmit={handleSubmit}
                  variants={formCardVariants}
                  initial={motionEnabled ? 'hidden' : false}
                  animate='show'
                  className='rounded-[22px] border border-white/76 bg-white/78 p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.48)] backdrop-blur-lg sm:p-7'
                >
                  <motion.div variants={formItemVariants}>
                    <h2 className='text-[30px] font-bold leading-tight tracking-normal text-[#0F172A]'>
                      {t('auth.loginTitle')}
                    </h2>
                    <p className='mt-2 text-[15px] font-medium leading-6 text-slate-500'>
                      {t('auth.loginSubtitle')}
                    </p>
                  </motion.div>

                  <motion.div variants={formItemVariants} className='mt-8 space-y-5'>
                    <LoginField
                      id='admin-login-email'
                      type='email'
                      autoComplete='email'
                      label={t('auth.email')}
                      icon={<Mail className='h-5 w-5' aria-hidden='true' />}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onInvalid={handleInvalidField}
                    />
                    <LoginField
                      id='admin-login-password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      label={t('auth.password')}
                      icon={<LockKeyhole className='h-5 w-5' aria-hidden='true' />}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onInvalid={handleInvalidField}
                      rightAction={
                        <button
                          type='button'
                          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                          onClick={() => setShowPassword((current) => !current)}
                          className='grid h-8 w-8 place-items-center rounded-full text-slate-400 transition-colors duration-75 hover:bg-[#EEF6FF] hover:text-slate-800 active:bg-[#DFF0FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(77,163,255,0.22)]'
                        >
                          {showPassword ? (
                            <EyeOff className='h-5 w-5' aria-hidden='true' />
                          ) : (
                            <Eye className='h-5 w-5' aria-hidden='true' />
                          )}
                        </button>
                      }
                    />
                  </motion.div>

                  <motion.div variants={formItemVariants} className='mt-4 flex items-center justify-end'>
                    <a
                      href='mailto:support@figurelab.local'
                      className='group relative rounded-lg text-sm font-semibold text-[#2F91D0] transition-colors duration-75 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out hover:text-[#1F6FB0] hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(77,163,255,0.22)] focus-visible:after:scale-x-100'
                    >
                      {t('auth.forgotPassword')}
                    </a>
                  </motion.div>

                  <motion.div
                    variants={formItemVariants}
                    whileHover={motionEnabled && !loading ? { y: -1 } : undefined}
                    whileTap={motionEnabled && !loading ? { scale: 0.99, y: 0 } : undefined}
                  >
                    <Button
                      type='submit'
                      disabled={loading}
                      loading={loading}
                      rightIcon={
                        !loading ? <ArrowRight className='h-4 w-4' aria-hidden='true' /> : undefined
                      }
                      className='mt-7 min-h-13 w-full rounded-2xl bg-[#4DA3FF] py-3.5 text-base shadow-[0_16px_30px_-24px_rgba(47,145,208,0.72)] hover:bg-[#2F91D0] active:bg-[#1F78B8] active:shadow-[0_10px_20px_-18px_rgba(47,145,208,0.78)]'
                    >
                      {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </Button>
                  </motion.div>
                </motion.form>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
