import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo-container">
          <img src="/images/ofs_logo.png" alt="OFS Global" className="logo" />
          <h1>OFS Global</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><Link to="/login">Войти</Link></li>
            <li><Link to="/register">Регистрация</Link></li>
          </ul>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2>Организационная структура предприятия</h2>
            <p>Создавайте, визуализируйте и управляйте организационной структурой вашей компании</p>
            <div className="cta-buttons">
              <Link to="/dashboard" className="cta-button primary">Начать работу</Link>
              <Link to="/demo" className="cta-button secondary">Демо</Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Возможности системы</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Организационная структура</h3>
              <p>Создавайте гибкую иерархическую структуру с поддержкой произвольной вложенности</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Локации</h3>
              <p>Управляйте локациями и их структурой с интеграцией в общую систему</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Перекрестное подчинение</h3>
              <p>Гибкая система функционального, административного и территориального подчинения</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Визуализация</h3>
              <p>Интерактивные диаграммы и графы для наглядного представления структуры</p>
            </div>
          </div>
        </section>

        <section className="main-sections">
          <h2>Основные разделы</h2>
          <div className="sections-grid">
            <div className="section-card">
              <div className="section-icon">🏢</div>
              <h3>Организационная структура</h3>
              <p>Управление иерархией предприятия</p>
              <Link to="/structure" className="section-button">Перейти</Link>
            </div>
            <div className="section-card">
              <div className="section-icon">📍</div>
              <h3>Локации</h3>
              <p>Географические расположения подразделений</p>
              <Link to="/locations" className="section-button">Перейти</Link>
            </div>
            <div className="section-card">
              <div className="section-icon">👥</div>
              <h3>Сотрудники</h3>
              <p>Управление персоналом компании</p>
              <Link to="/employees" className="section-button">Перейти</Link>
            </div>
            <div className="section-card">
              <div className="section-icon">📊</div>
              <h3>Отчеты</h3>
              <p>Аналитика и статистика организации</p>
              <Link to="/reports" className="section-button">Перейти</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-links">
          <div className="footer-section">
            <h4>OFS Global</h4>
            <ul>
              <li><Link to="/about">О нас</Link></li>
              <li><Link to="/contact">Контакты</Link></li>
              <li><Link to="/terms">Условия использования</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Документация</h4>
            <ul>
              <li><Link to="/docs/api">API</Link></li>
              <li><Link to="/docs/user-guide">Руководство пользователя</Link></li>
              <li><Link to="/docs/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          &copy; {new Date().getFullYear()} OFS Global. Все права защищены.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 