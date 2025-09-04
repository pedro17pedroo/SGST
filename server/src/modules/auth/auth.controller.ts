import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { UserModel } from "../users/user.model";
import { z } from "zod";
import { generateAccessToken, generateRefreshToken, verifyToken, isRefreshToken } from "../../config/jwt";

const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Password é obrigatória"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password atual é obrigatória"),
  newPassword: z.string().min(6, "Nova password deve ter pelo menos 6 caracteres"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
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
      const isValidPassword = await bcryptjs.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      // Gerar tokens JWT
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Dados do usuário para resposta (sem senha)
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      };

      // Verificar se GPS é obrigatório para este utilizador
      const requiresGPS = ['operator', 'driver'].includes(user.role);

      res.json({
        message: "Login realizado com sucesso",
        user: userResponse,
        accessToken,
        refreshToken,
        requiresGPS
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

  static async loginWithToken(req: Request, res: Response) {
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
      const isValidPassword = await bcryptjs.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      // Gerar tokens JWT
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      };

      // Verificar se GPS é obrigatório para este utilizador
      const requiresGPS = ['operator', 'driver'].includes(user.role);

      res.json({
        message: "Login realizado com sucesso",
        user: userResponse,
        accessToken,
        refreshToken,
        requiresGPS
      });

    } catch (error) {
      console.error('Error durante login com token:', error);
      
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

  static async refreshToken(req: Request, res: Response) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const { refreshToken } = validatedData;

      // Verificar se o refresh token é válido
      const decoded = verifyToken(refreshToken);
      if (!decoded || !isRefreshToken(decoded)) {
        return res.status(401).json({ 
          message: "Refresh token inválido ou expirado" 
        });
      }

      // Buscar o usuário
      const user = await UserModel.getById(decoded.userId);
      if (!user) {
        return res.status(404).json({ 
          message: "Usuário não encontrado" 
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ 
          message: "Conta desativada" 
        });
      }

      // Gerar novos tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });

    } catch (error) {
      console.error('Error durante refresh token:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(401).json({ 
        message: "Refresh token inválido" 
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // Com JWT, o logout é feito no frontend removendo os tokens
      // Aqui podemos implementar uma blacklist de tokens se necessário
      res.json({ 
        message: "Logout realizado com sucesso" 
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
      // Com JWT, o usuário vem do middleware requireAuth
      const sessionUser = (req as any).user;
      
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
      // Com JWT, o usuário vem do middleware requireAuth
      const sessionUser = (req as any).user;
      
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

      // Com JWT, não precisamos atualizar sessão

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
      // Com JWT, o usuário vem do middleware requireAuth
      const sessionUser = (req as any).user;
      
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
      const isValidCurrentPassword = await bcryptjs.compare(currentPassword, user.password);
      
      if (!isValidCurrentPassword) {
        return res.status(400).json({ 
          message: "Password atual incorreta",
          error: "INVALID_CURRENT_PASSWORD"
        });
      }

      // Hash da nova password
      const saltRounds = 12;
      const hashedNewPassword = await bcryptjs.hash(newPassword, saltRounds);

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

  static async getCurrentUser(req: Request, res: Response) {
    try {
      // Com JWT, o usuário vem do middleware requireAuth
      const sessionUser = (req as any).user;
      
      if (!sessionUser) {
        return res.status(401).json({ 
          message: "Não autenticado",
          error: "NOT_AUTHENTICATED"
        });
      }

      // Buscar dados atualizados do utilizador incluindo permissões
      const user = await UserModel.getById(sessionUser.id);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          message: "Utilizador inválido ou desativado",
          error: "INVALID_USER"
        });
      }

      // Buscar permissões do utilizador
      const permissions = await UserModel.getUserPermissions(sessionUser.id);

      const currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        permissions: permissions
      };

      res.json(currentUser);

    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ 
        message: "Erro interno do servidor" 
      });
    }
  }
}