/**
 * Mock do hook useToast para testes
 */

export const useToast = () => ({
  toast: jest.fn(),
  dismiss: jest.fn(),
  toasts: [],
});