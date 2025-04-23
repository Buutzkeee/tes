import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

// Componentes de UI
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import Logo from '@/components/common/Logo';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    oabNumber: '',
    oabState: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, error, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se já estiver autenticado, redirecionar para o dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro específico quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    // Validar CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/[^\d]/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Validar número da OAB
    if (!formData.oabNumber.trim()) {
      newErrors.oabNumber = 'Número da OAB é obrigatório';
    }
    
    // Validar estado da OAB
    if (!formData.oabState.trim()) {
      newErrors.oabState = 'Estado da OAB é obrigatório';
    } else if (formData.oabState.length !== 2) {
      newErrors.oabState = 'Use a sigla do estado (ex: SP)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...registerData } = formData;
      
      await register(registerData);
    } catch (error) {
      console.error('Erro no registro:', error);
      setFormError(error.response?.data?.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo className="w-auto h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            faça login se já possui uma conta
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(error || formError) && (
            <Alert 
              type="error" 
              message={error || formError} 
              onClose={clearError} 
              className="mb-4" 
            />
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                id="name"
                name="name"
                type="text"
                label="Nome completo"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </div>

            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label="E-mail"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
              </div>

              <div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>

            <div>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                label="CPF"
                value={formData.cpf}
                onChange={handleChange}
                error={errors.cpf}
                required
                placeholder="000.000.000-00"
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <Input
                  id="oabNumber"
                  name="oabNumber"
                  type="text"
                  label="Número da OAB"
                  value={formData.oabNumber}
                  onChange={handleChange}
                  error={errors.oabNumber}
                  required
                />
              </div>

              <div>
                <Input
                  id="oabState"
                  name="oabState"
                  type="text"
                  label="Estado da OAB"
                  value={formData.oabState}
                  onChange={handleChange}
                  error={errors.oabState}
                  required
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Registrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
