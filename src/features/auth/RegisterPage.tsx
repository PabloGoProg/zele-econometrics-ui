import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from './schemas';
import { useAuthStore } from '@/stores/authStore';
import { extractApiError } from '@/lib/errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/app', { replace: true });
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Nuevo acceso</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary-950">Crear cuenta</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Regístrate para acceder a los modelos
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <Input
            id="name"
            label="Nombre"
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full" size="lg">
            Registrarse
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-900">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
