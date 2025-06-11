/**
 * Centralized error handling utility
 */

// Error types for better categorization
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

// Custom error class with additional properties
export class AppError extends Error {
  type: ErrorType;
  originalError?: any;
  context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    originalError?: any,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.context = context;
  }
}

// Function to handle errors consistently
export const handleError = (
  error: any,
  fallbackMessage: string = 'Si è verificato un errore imprevisto',
  context?: Record<string, any>
): AppError => {
  console.error('Error occurred:', error, context);
  
  // If it's already an AppError, just return it
  if (error instanceof AppError) {
    return error;
  }
  
  // Determine error type based on the error
  let type = ErrorType.UNKNOWN;
  let message = fallbackMessage;
  
  if (error instanceof Error) {
    message = error.message || fallbackMessage;
    
    // Try to determine error type from message or name
    if (error.message.includes('authentication') || error.message.includes('login') || 
        error.message.includes('token') || error.message.includes('session')) {
      type = ErrorType.AUTHENTICATION;
    } else if (error.message.includes('network') || error.message.includes('fetch') || 
               error.message.includes('connection')) {
      type = ErrorType.NETWORK;
    } else if (error.message.includes('database') || error.message.includes('supabase') || 
               error.message.includes('storage')) {
      type = ErrorType.DATABASE;
    } else if (error.message.includes('validation') || error.message.includes('required') || 
               error.message.includes('invalid')) {
      type = ErrorType.VALIDATION;
    } else if (error.message.includes('permission') || error.message.includes('access') || 
               error.message.includes('unauthorized')) {
      type = ErrorType.PERMISSION;
    }
  }
  
  return new AppError(message, type, error, context);
};

// Function to log errors to a service (could be extended to send to a backend)
export const logError = (error: any, context?: Record<string, any>): void => {
  const appError = error instanceof AppError ? error : handleError(error, undefined, context);
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.group('Error Details');
    console.error('Error:', appError.message);
    console.error('Type:', appError.type);
    console.error('Stack:', appError.stack);
    if (appError.originalError) {
      console.error('Original Error:', appError.originalError);
    }
    if (appError.context) {
      console.error('Context:', appError.context);
    }
    console.groupEnd();
  }
  
  // In production, you would send this to an error tracking service
  // Example: sendToErrorTrackingService(appError);
};

// Function to get user-friendly error message
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return 'Si è verificato un problema con l\'autenticazione. Prova ad effettuare nuovamente il login.';
      case ErrorType.NETWORK:
        return 'Problema di connessione. Verifica la tua connessione internet e riprova.';
      case ErrorType.DATABASE:
        return 'Problema nell\'accesso ai dati. Riprova tra qualche istante.';
      case ErrorType.VALIDATION:
        return error.message || 'I dati inseriti non sono validi. Verifica e riprova.';
      case ErrorType.PERMISSION:
        return 'Non hai i permessi necessari per eseguire questa operazione.';
      default:
        return error.message || 'Si è verificato un errore imprevisto. Riprova più tardi.';
    }
  }
  
  if (error instanceof Error) {
    return error.message || 'Si è verificato un errore imprevisto. Riprova più tardi.';
  }
  
  return 'Si è verificato un errore imprevisto. Riprova più tardi.';
};