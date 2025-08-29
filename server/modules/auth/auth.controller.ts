import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../users/user.model';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(3, "Nome de utilizador deve ter pelo menos 3 caracteres"),
  password: z.string().min(1, "Password é obrigatória"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password atual é obrigatória"),
  newPassword: z.string().min(6, "Nova password deve ter pelo menos 6 caracteres"),
});

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = loginSchema.parse(req.body);

      // Buscar utilizador por username
      const user = await UserModel.getByUsername(username);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          message: "Conta desativada. Contacte o administrador.",
          error: "ACCOUNT_DISABLED"
        });
      }

      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      // Criar sessão
      const sessionUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      };

      (req.session as any).user = sessionUser;

      res.json({
        message: "Login realizado com sucesso",
        user: sessionUser
      });

    } catch (error) {
      console.error('Error durante login:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro interno do servidor", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ 
            message: "Erro ao terminar sessão" 
          });
        }
        
        res.clearCookie('connect.sid', { 
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        });
        
        res.json({ 
          message: "Logout realizado com sucesso" 
        });
      });
    } catch (error) {
      console.error('Error durante logout:', error);
      res.status(500).json({ 
        message: "Erro interno do servidor" 
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ 
          message: "Não autenticado",
          error: "NOT_AUTHENTICATED"
        });
      }

      // Buscar dados atualizados do utilizador
      const user = await UserModel.getById(sessionUser.id);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          message: "Utilizador inválido ou desativado",
          error: "INVALID_USER"
        });
      }

      const userProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      };

      res.json(userProfile);

    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ 
        message: "Erro interno do servidor" 
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ 
          message: "Não autenticado",
          error: "NOT_AUTHENTICATED"
        });
      }

      const { email } = req.body;

      // Atualizar apenas campos permitidos (email, por exemplo)
      const updatedUser = await UserModel.update(sessionUser.id, { 
        email: email || sessionUser.email 
      });

      if (!updatedUser) {
        return res.status(404).json({ 
          message: "Utilizador não encontrado" 
        });
      }

      // Atualizar dados da sessão
      (req.session as any).user = {
        ...sessionUser,
        email: updatedUser.email
      };

      const userProfile = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      };

      res.json({
        message: "Perfil atualizado com sucesso",
        user: userProfile
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        message: "Erro interno do servidor" 
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ 
          message: "Não autenticado",
          error: "NOT_AUTHENTICATED"
        });
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      // Buscar utilizador atual
      const user = await UserModel.getById(sessionUser.id);
      
      if (!user) {
        return res.status(404).json({ 
          message: "Utilizador não encontrado" 
        });
      }

      // Verificar password atual
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidCurrentPassword) {
        return res.status(400).json({ 
          message: "Password atual incorreta",
          error: "INVALID_CURRENT_PASSWORD"
        });
      }

      // Hash da nova password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar password
      await UserModel.update(sessionUser.id, { 
        password: hashedNewPassword 
      });

      res.json({
        message: "Password alterada com sucesso"
      });

    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro interno do servidor" 
      });
    }
  }
}