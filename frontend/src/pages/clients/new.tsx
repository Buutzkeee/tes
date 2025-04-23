import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';

export default function NewClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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
    
    // Validar CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/[^\d]/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post('/clients', formData);
      setFormSuccess('Cliente cadastrado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/clients');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      setFormError(error.response?.data?.message || 'Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Novo Cliente</h1>
          
          <div className="mt-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Informações do Cliente</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Preencha os dados do novo cliente. Os campos marcados com * são obrigatórios.
                  </p>
                </div>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 bg-white sm:p-6">
                      {formError && (
                        <Alert
                          type="error"
                          message={formError}
                          className="mb-4"
                          onClose={() => setFormError('')}
                        />
                      )}
                      
                      {formSuccess && (
                        <Alert
                          type="success"
                          message={formSuccess}
                          className="mb-4"
                        />
                      )}
                      
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                          <Input
                            id="name"
                            name="name"
                            label="Nome completo *"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-4">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            label="E-mail *"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <Input
                            id="cpf"
                            name="cpf"
                            label="CPF *"
                            value={formData.cpf}
                            onChange={handleChange}
                            error={errors.cpf}
                            placeholder="000.000.000-00"
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <Input
                            id="phone"
                            name="phone"
                            label="Telefone *"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="(00) 00000-0000"
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <Input
                            id="address"
                            name="address"
                            label="Endereço"
                            value={formData.address}
                            onChange={handleChange}
                            error={errors.address}
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="mr-3"
                        onClick={() => router.push('/clients')}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
