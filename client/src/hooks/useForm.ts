import { useState, useCallback } from 'react';
import { FormErrors } from '../types/index';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  touched: Record<string, boolean>;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: string, error: string) => void;
  setErrors: (errors: FormErrors) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when value changes
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: undefined }));
    }
  }, [errors]);

  const setValuesPartial = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setErrorsObj = useCallback((newErrors: FormErrors) => {
    setErrors(newErrors);
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValue(field, e.target.value);
    };
  }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({ ...prev, [field as string]: true }));
      
      // Validate field on blur if validator is provided
      if (validate && touched[field as string]) {
        const fieldErrors = validate(values);
        if (fieldErrors[field as string]) {
          setError(field as string, fieldErrors[field as string]!);
        }
      }
    };
  }, [validate, values, touched, setError]);

  const validateField = useCallback((field: keyof T): boolean => {
    if (!validate) return true;
    
    const fieldErrors = validate(values);
    const fieldError = fieldErrors[field as string];
    
    if (fieldError) {
      setError(field as string, fieldError);
      return false;
    } else {
      clearError(field as string);
      return true;
    }
  }, [validate, values, setError, clearError]);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;
    
    const formErrors = validate(values);
    setErrors(formErrors);
    
    return Object.keys(formErrors).length === 0;
  }, [validate, values]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onSubmit) return;
    
    const isValid = validateForm();
    if (!isValid) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    touched,
    setValue,
    setValues: setValuesPartial,
    setError,
    setErrors: setErrorsObj,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
}
