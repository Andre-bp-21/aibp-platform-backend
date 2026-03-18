import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, company } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Email ya registrado' });
        return;
      }

      const user = new User({
        email,
        password,
        name,
        company: company || '',
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error en registro',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email y password requeridos' });
        return;
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        return;
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        return;
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error en login',
      });
    }
  }

  static async getMe(req: any, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
