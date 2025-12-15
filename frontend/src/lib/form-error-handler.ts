import { FieldErrors, FieldPath, FieldValues } from 'react-hook-form';
import { toast } from '../hooks/use-toast';
import { APIException } from '../types';

export interface FormErrorContext {
  formName?: string;
  fieldName?: string;
  action?: string;
}

export class FormErrorHandler {
  static handleFieldErrors<T extends FieldValues>(
    errors: FieldErrors<T>,
    _context?: FormErrorContext
  ) {
    const errorMessages: string[] = [];
    
    Object.entries(errors).forEach(([field, error]) => {
      if (error?.message) {
        errorMessages.push(`${field}: ${error.message}`);
      }
    });

    if (errorMessages.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Form Validation Error',
        description: errorMessages.join(', '),
      });
    }
  }

  static handleSubmissionError(
    error: Error | APIException,
    _context?: FormErrorContext
  ) {
    let title = 'Form Submission Error';
    let description = 'Please check your input and try again.';

    if (error instanceof APIException) {
      if (error.status === 400) {
        title = 'Invalid Input';
        description = error.message || 'Please check your form data and try again.';
      } else if (error.status === 422) {
        title = 'Validation Error';
        description = error.message || 'Some fields contain invalid data.';
      } else if (error.status && error.status >= 500) {
        title = 'Server Error';
        description = 'Unable to process your request. Please try again later.';
      }
    }

    toast({
      variant: 'destructive',
      title,
      description,
    });
  }

  static getFieldError<T extends FieldValues>(
    errors: FieldErrors<T>,
    fieldName: FieldPath<T>
  ): string | undefined {
    const error = errors[fieldName];
    return error?.message as string | undefined;
  }

  static hasFieldError<T extends FieldValues>(
    errors: FieldErrors<T>,
    fieldName: FieldPath<T>
  ): boolean {
    return !!errors[fieldName];
  }

  static createFieldErrorProps<T extends FieldValues>(
    errors: FieldErrors<T>,
    fieldName: FieldPath<T>
  ) {
    const hasError = this.hasFieldError(errors, fieldName);
    const errorMessage = this.getFieldError(errors, fieldName);

    return {
      error: hasError,
      helperText: errorMessage,
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${fieldName}-error` : undefined,
    };
  }
}

// Hook for form error handling
export function useFormErrorHandler() {
  const handleFieldErrors = <T extends FieldValues>(
    errors: FieldErrors<T>,
    context?: FormErrorContext
  ) => {
    FormErrorHandler.handleFieldErrors(errors, context);
  };

  const handleSubmissionError = (
    error: Error | APIException,
    context?: FormErrorContext
  ) => {
    FormErrorHandler.handleSubmissionError(error, context);
  };

  const getFieldError = <T extends FieldValues>(
    errors: FieldErrors<T>,
    fieldName: FieldPath<T>
  ) => {
    return FormErrorHandler.getFieldError(errors, fieldName);
  };

  const hasFieldError = <T extends FieldValues>(
    errors: FieldErrors<T>,
    fieldName: FieldPath<T>
  ) => {
    return FormErrorHandler.hasFieldError(errors, fieldName);
  };

  const createFieldErrorProps = <T extends FieldValues>(
    errors: FieldErrors<T>,
    fieldName: FieldPath<T>
  ) => {
    return FormErrorHandler.createFieldErrorProps(errors, fieldName);
  };

  return {
    handleFieldErrors,
    handleSubmissionError,
    getFieldError,
    hasFieldError,
    createFieldErrorProps,
  };
}