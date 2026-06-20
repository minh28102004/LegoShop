'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from 'react';
import { motion, type Variants, useReducedMotion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/common/components/ui/Button';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { cn } from '@/common/utils/cn';
import { useI18n } from '@/lib/i18n/useI18n';
import LanguageSwitcher from '@/modules/admin/components/LanguageSwitcher';
import { login } from '@/modules/auth/services/authApi';
import { setAccessToken } from '@/modules/auth/services/authStorage';
import BannerCarousel from '@/modules/auth/components/BannerCarousel';

const LegoScene = dynamic(() => import('@/components/LegoScene'), {
  ssr: false,
  loading: () => (
    <div className='absolute inset-0 bg-[linear-gradient(130deg,rgba(246,248,252,0.9),rgba(247,250,255,0.7)),radial-gradient(circle_at_22%_18%,rgba(77,163,255,0.22),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(245,197,66,0.18),transparent_38%)]' />
  ),
});

const shellVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const leftPanelVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const rightPanelVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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
      ease: [0.22, 1, 0.36, 1],
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
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
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
      <div className='group relative rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors duration-150 ease-out hover:border-slate-300 focus-within:border-[var(--admin-primary)]'>
        <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#2F91D0]'>
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
            'h-13 w-full rounded-2xl bg-transparent pl-12 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400',
            rightAction ? 'pr-13' : 'pr-4',
          )}
        />
        {rightAction ? (
          <span className='absolute right-2 top-1/2 -translate-y-1/2'>{rightAction}</span>
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
          className='relative grid w-full overflow-hidden rounded-[24px] border border-white/70 bg-white/46 shadow-[0_34px_110px_-58px_rgba(15,23,42,0.56)] backdrop-blur-2xl lg:min-h-[660px] lg:grid-cols-[minmax(0,0.98fr)_minmax(392px,0.9fr)] xl:rounded-[28px]'
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
              <div className='relative rounded-[22px] border border-white/72 bg-white/50 p-2.5 shadow-[0_20px_58px_-44px_rgba(15,23,42,0.54)] backdrop-blur-xl'>
                <div className='grid min-h-[218px] grid-cols-12 grid-rows-[101px_101px] gap-2.5 sm:min-h-[238px] sm:grid-rows-[111px_111px]'>
                  <div className='relative col-span-7 row-span-2 overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_16px_34px_-28px_rgba(15,23,42,0.48)]'>
                    <Image
                      src='/login-lego-shop-banner.png'
                      alt='Figure Lab Lego minifigure shop showcase'
                      width={1920}
                      height={768}
                      priority
                      className='h-full w-full object-cover object-center'
                    />
                    <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.14))]' />
                  </div>

                  <div className='relative col-span-5 overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_14px_30px_-28px_rgba(15,23,42,0.44)]'>
                    <Image
                      src='/login-template-birthday.png'
                      alt='Birthday figure template preview'
                      width={1000}
                      height={1000}
                      className='h-full w-full object-cover object-[50%_34%]'
                    />
                  </div>

                  <div className='relative col-span-5 grid grid-cols-2 gap-2.5'>
                    <div className='relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_14px_30px_-28px_rgba(15,23,42,0.44)]'>
                      <Image
                        src='/login-template-graduation-b.png'
                        alt='Graduation frame template preview'
                        width={1000}
                        height={1000}
                        className='h-full w-full object-cover object-[50%_26%]'
                      />
                    </div>
                    <div className='relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_14px_30px_-28px_rgba(15,23,42,0.44)]'>
                      <Image
                        src='/login-template-valentine.png'
                        alt='Valentine figure template preview'
                        width={1000}
                        height={1000}
                        className='h-full w-full object-cover object-[58%_30%]'
                      />
                    </div>
                  </div>
                </div>

                <div className='pointer-events-none absolute -bottom-3 left-9 h-11 w-24 rounded-2xl border border-white/70 bg-white/58 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.54)] backdrop-blur-xl' />
                <div className='pointer-events-none absolute -right-2 top-8 h-14 w-12 rotate-6 rounded-2xl border border-white/70 bg-[#F5C542]/66 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.54)] backdrop-blur-xl' />
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
                  <span className='grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.55)] ring-1 ring-white/80'>
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
                    <p className='text-sm font-bold text-slate-500'>Figure Lab</p>
                    <p className='truncate text-lg font-bold leading-6 text-slate-950'>
                      Admin Console
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
                  className='rounded-[22px] border border-white/76 bg-white/78 p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.48)] backdrop-blur-2xl sm:p-7'
                >
                  <motion.div variants={formItemVariants}>
                    <h2 className='text-[30px] font-bold leading-tight tracking-normal text-[#0F172A]'>
                      Đăng nhập quản trị
                    </h2>
                    <p className='mt-2 text-[15px] font-medium leading-6 text-slate-500'>
                      Quản lý hệ thống bán hàng Lego & Figure
                    </p>
                  </motion.div>

                  <motion.div variants={formItemVariants} className='mt-8 space-y-5'>
                    <LoginField
                      id='admin-login-email'
                      type='email'
                      autoComplete='email'
                      label='Email'
                      icon={<Mail className='h-5 w-5' aria-hidden='true' />}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onInvalid={handleInvalidField}
                    />
                    <LoginField
                      id='admin-login-password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      label='Password'
                      icon={<LockKeyhole className='h-5 w-5' aria-hidden='true' />}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onInvalid={handleInvalidField}
                      rightAction={
                        <button
                          type='button'
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          onClick={() => setShowPassword((current) => !current)}
                          className='grid h-10 w-10 place-items-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-[#EEF6FF] hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(77,163,255,0.14)]'
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
                      className='text-sm font-semibold text-[#2F91D0] transition-colors duration-200 hover:text-[#1F6FB0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(77,163,255,0.14)]'
                    >
                      Quên mật khẩu?
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
                      className='mt-7 min-h-13 w-full rounded-2xl bg-[#4DA3FF] py-3.5 text-base shadow-[0_18px_34px_-24px_rgba(47,145,208,0.78)] hover:bg-[#2F91D0] hover:shadow-[0_24px_44px_-26px_rgba(47,145,208,0.9)]'
                    >
                      {loading ? t('auth.signingIn') : 'Đăng nhập'}
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
