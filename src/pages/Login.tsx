import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

type Mode = "login" | "register" | "forgot";

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && 
                             SUPABASE_URL.includes('supabase.co') && 
                             SUPABASE_ANON_KEY.length > 50;

const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Reset form when mode changes
    setPassword("");
    setName("");
  }, [mode]);

  const notifyDemoAuth = () => {
    // Persist demo auth flag so app reloads / remembers across tabs
    localStorage.setItem('demoAuth', 'true');
    // Notify the app (current window) to pick up demo session immediately
    window.dispatchEvent(new CustomEvent('demo-authenticated'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If supabase is not configured, show helpful message and simulate login (demo)
    if (!isSupabaseConfigured) {
      toast.success("Modo desenvolvimento: login simulado");
      notifyDemoAuth();
      setLoading(false);
      navigate("/", { replace: true });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Erro ao fazer login");
      } else {
        toast.success("Login realizado com sucesso!");
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err?.message || "Erro ao tentar fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured) {
      toast.success("Modo desenvolvimento: conta criada (simulada)");
      notifyDemoAuth();
      setLoading(false);
      navigate("/", { replace: true });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim()
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        toast.error(error.message || "Erro ao criar conta");
      } else {
        toast.success("Conta criada! Verifique seu e-mail para confirmação.");
        setMode("login");
      }
    } catch (err: any) {
      console.error("Register error:", err);
      toast.error(err?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured) {
      toast.success("Modo desenvolvimento: email de recuperação simulado");
      setLoading(false);
      setMode("login");
      return;
    }

    try {
      // ✅ CORRIGIR AQUI - Adicionar redirectTo
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Erro ao enviar email de recuperação");
      } else {
        toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        setMode("login");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      toast.error(err?.message || "Erro ao solicitar recuperação de senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1f2e]">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#3d8a7d] rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">$</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Grana em <span className="text-[#3d8a7d]">Dia</span>
          </h1>
          <p className="text-gray-400 mt-1">Entre na sua conta</p>
          {!isSupabaseConfigured && (
            <div className="mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
              Modo desenvolvimento ativo
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="bg-[#1e2538] rounded-lg p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : "Recuperar senha"}
          </h2>

          <form onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot}>
            {/* Name Field - Only for register */}
            {mode === "register" && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-400 mb-2">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f5f5c6] text-gray-800 rounded-md py-3 px-10 focus:outline-none"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f5f5c6] text-gray-800 rounded-md py-3 px-10 focus:outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field - Only show for login and register */}
            {mode !== "forgot" && (
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-400 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f5f5c6] text-gray-800 rounded-md py-3 px-10 pr-10 focus:outline-none"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3d8a7d] hover:bg-[#347a6d] text-white py-3 rounded-md font-medium transition-colors"
            >
              {loading
                ? "Processando..."
                : mode === "login"
                ? "Entrar"
                : mode === "register"
                ? "Criar conta"
                : "Enviar link"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-[#3d8a7d] hover:text-[#4db8a8] text-sm transition-colors"
                >
                  Esqueceu sua senha?
                </button>
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Não tem conta? </span>
                  <button
                    onClick={() => setMode("register")}
                    className="text-[#3d8a7d] hover:text-[#4db8a8] text-sm transition-colors"
                  >
                    Criar uma
                  </button>
                </div>
              </>
            )}

            {mode === "register" && (
              <div>
                <span className="text-gray-400 text-sm">Já tem uma conta? </span>
                <button
                  onClick={() => setMode("login")}
                  className="text-[#3d8a7d] hover:text-[#4db8a8] text-sm transition-colors"
                >
                  Entrar
                </button>
              </div>
            )}

            {mode === "forgot" && (
              <div>
                <span className="text-gray-400 text-sm">Lembrou sua senha? </span>
                <button
                  onClick={() => setMode("login")}
                  className="text-[#3d8a7d] hover:text-[#4db8a8] text-sm transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;