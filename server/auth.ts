import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { csrf } from "lusca";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(csrf());

  // Use email instead of username for Brazilian context
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.passwordHash))) {
            return done(null, false, { message: 'Email ou senha incorretos' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      
      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false, 
          message: "Email, senha e nome são obrigatórios" 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: "A senha deve ter pelo menos 6 caracteres" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Este email já está em uso" 
        });
      }

      // Create new user
      const user = await storage.createUser({
        email,
        passwordHash: await hashPassword(password),
        name,
        isAdmin: false
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
          },
          message: "Conta criada com sucesso"
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro interno do servidor" 
      });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Erro interno do servidor" 
        });
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Email ou senha incorretos" 
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: "Erro ao fazer login" 
          });
        }
        
        res.json({ 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
          },
          message: "Login realizado com sucesso"
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Erro ao fazer logout" 
        });
      }
      res.json({ 
        success: true, 
        message: "Logout realizado com sucesso" 
      });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Usuário não autenticado" 
      });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        isAdmin: req.user.isAdmin
      }
    });
  });
}

export { hashPassword, comparePasswords };