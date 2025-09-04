import { Request, Response } from 'express';
import { CustomerModel } from './customers.model';
import { insertCustomerSchema } from '../../../../shared/schema';
import { z } from 'zod';

const updateCustomerSchema = insertCustomerSchema.partial();

export class CustomerController {
  static async getCustomers(req: Request, res: Response) {
    try {
      const customers = await CustomerModel.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar clientes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({ 
        message: "Erro ao buscar cliente", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async searchCustomers(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Parâmetro de pesquisa é obrigatório" });
      }

      const customers = await CustomerModel.searchCustomers(q);
      res.json(customers);
    } catch (error) {
      console.error('Error searching customers:', error);
      res.status(500).json({ 
        message: "Erro ao pesquisar clientes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getActiveCustomers(req: Request, res: Response) {
    try {
      const customers = await CustomerModel.getActiveCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching active customers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar clientes ativos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCustomerStats(req: Request, res: Response) {
    try {
      const stats = await CustomerModel.getCustomerStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      res.status(500).json({ 
        message: "Erro ao buscar estatísticas de clientes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTopCustomers(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      const customers = await CustomerModel.getTopCustomers(Number(limit));
      res.json(customers);
    } catch (error) {
      console.error('Error fetching top customers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar principais clientes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createCustomer(req: Request, res: Response) {
    try {
      const customerData = insertCustomerSchema.parse(req.body);

      // Verificar se o email já existe (se fornecido)
      if (customerData.email) {
        const emailExists = await CustomerModel.checkEmailExists(customerData.email);
        if (emailExists) {
          return res.status(400).json({ 
            message: "Email já existe",
            error: "EMAIL_EXISTS"
          });
        }
      }

      const customer = await CustomerModel.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar cliente", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customerData = updateCustomerSchema.parse(req.body);

      // Verificar se o cliente existe
      const existingCustomer = await CustomerModel.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      // Número do cliente é gerado automaticamente e não pode ser alterado

      // Verificar se o email já existe (se sendo alterado)
      if (customerData.email && customerData.email !== existingCustomer.email) {
        const emailExists = await CustomerModel.checkEmailExists(customerData.email, id);
        if (emailExists) {
          return res.status(400).json({ 
            message: "Email já existe",
            error: "EMAIL_EXISTS"
          });
        }
      }

      const customer = await CustomerModel.updateCustomer(id, customerData);
      res.json(customer);
    } catch (error) {
      console.error('Error updating customer:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar cliente", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o cliente existe
      const existingCustomer = await CustomerModel.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      await CustomerModel.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar cliente", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deactivateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o cliente existe
      const existingCustomer = await CustomerModel.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      const customer = await CustomerModel.deactivateCustomer(id);
      res.json(customer);
    } catch (error) {
      console.error('Error deactivating customer:', error);
      res.status(500).json({ 
        message: "Erro ao desativar cliente", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async activateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o cliente existe
      const existingCustomer = await CustomerModel.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      const customer = await CustomerModel.activateCustomer(id);
      res.json(customer);
    } catch (error) {
      console.error('Error activating customer:', error);
      res.status(500).json({ 
        message: "Erro ao ativar cliente", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}