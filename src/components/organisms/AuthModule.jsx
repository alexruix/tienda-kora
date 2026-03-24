/**
 * AuthModule.jsx — Organism
 * KORA · NODO Studio
 *
 * Formulario interactivo para inicio de sesión, registro y 
 * recuperación de contraseña en "Mi Cuenta".
 */

import React, { useState } from 'react';
import { AuthContent } from '../../data/authContent';

export function AuthModule({ onAuthSuccess, className = '' }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simular llamada auth
    setTimeout(() => {
      setLoading(false);
      if (onAuthSuccess) onAuthSuccess();
    }, 1500);
  };

  return (
    <div className={`w-full max-w-sm mx-auto p-6 md:p-8 rounded-f2-lg bg-white border border-sand-200 shadow-sm ${className}`}>
      
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-petrol mb-2">
          {mode === 'login' && AuthContent.login.title}
          {mode === 'register' && AuthContent.register.title}
          {mode === 'forgot' && AuthContent.forgot.title}
        </h2>
        <p className="font-sans text-[14px] text-sand-500">
          {mode === 'login' && AuthContent.login.subtitle}
          {mode === 'register' && AuthContent.register.subtitle}
          {mode === 'forgot' && AuthContent.forgot.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {mode === 'register' && (
          <div>
            <label className="block font-sans text-[12px] font-semibold tracking-widest uppercase text-petrol mb-1.5 ml-1">
              {AuthContent.register.fields.fullName}
            </label>
            <input 
              type="text" 
              required 
              className="w-full h-12 px-4 rounded-f2-md bg-sand-100 border border-sand-200 focus:border-petrol outline-none font-sans text-[14px] transition-colors" 
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label className="block font-sans text-[12px] font-semibold tracking-widest uppercase text-petrol mb-1.5 ml-1">
            {AuthContent.register.fields.email}
          </label>
          <input 
            type="email" 
            required 
            className="w-full h-12 px-4 rounded-f2-md bg-sand-100 border border-sand-200 focus:border-petrol outline-none font-sans text-[14px] transition-colors" 
            disabled={loading}
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <label className="block font-sans text-[12px] font-semibold tracking-widest uppercase text-petrol mb-1.5 ml-1">
              {AuthContent.register.fields.password}
            </label>
            <input 
              type="password" 
              required 
              className="w-full h-12 px-4 rounded-f2-md bg-sand-100 border border-sand-200 focus:border-petrol outline-none font-sans text-[14px] transition-colors" 
              disabled={loading}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 mt-4 rounded-f2-md bg-petrol text-white font-sans text-[14px] font-semibold hover:bg-petrol-hover disabled:opacity-50 transition-colors"
        >
          {loading 
            ? AuthContent.loading 
            : mode === 'login' 
              ? AuthContent.login.submit 
              : mode === 'register' 
                ? AuthContent.register.submit 
                : AuthContent.forgot.submit}
        </button>

      </form>

      <div className="mt-6 flex flex-col items-center gap-2 font-sans text-[13px]">
        {mode === 'login' && (
          <>
            <button onClick={() => setMode('forgot')} className="text-sand-500 hover:text-watermelon underline">
              {AuthContent.login.forgotLink}
            </button>
            <button onClick={() => setMode('register')} className="text-petrol font-medium mt-2">
              {AuthContent.login.registerLink}
            </button>
          </>
        )}
        {mode === 'register' && (
          <button onClick={() => setMode('login')} className="text-petrol font-medium mt-2">
            {AuthContent.register.loginLink}
          </button>
        )}
        {mode === 'forgot' && (
          <button onClick={() => setMode('login')} className="text-petrol font-medium mt-2">
            {AuthContent.forgot.backLink}
          </button>
        )}
      </div>

    </div>
  );
}
