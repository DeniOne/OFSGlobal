import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OrganizationTree from '../components/organization/OrganizationTree';
import '../styles/OrganizationStructurePage.css';

const OrganizationStructurePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Моковые данные для списка организаций
  const organizations = [
    { id: '1', name: 'ООО Фотоматрица' },
    { id: '2', name: 'Фотоматрица-Север' },
    { id: '3', name: 'Фотоматрица-Юг' },
  ];

  // Обработчик переключения режима редактирования
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="structure-page">
      <header className="structure-header">
        <div className="logo-container">
          <Link to="/">
            <img src="/images/ofs_logo.png" alt="OFS Global" className="logo" />
          </Link>
          <h1>Организационная структура</h1>
        </div>
        <nav className="structure-nav">
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/dashboard">Панель управления</Link></li>
            <li className="active"><Link to="/structure">Структура</Link></li>
            <li><Link to="/locations">Локации</Link></li>
          </ul>
        </nav>
      </header>

      <main className="structure-content">
        <aside className="structure-sidebar">
          <div className="sidebar-header">
            <h3>Организации</h3>
          </div>
          <ul className="organization-list">
            {organizations.map(org => (
              <li 
                key={org.id} 
                className={selectedOrgId === org.id ? 'active' : ''}
                onClick={() => setSelectedOrgId(org.id)}
              >
                {org.name}
              </li>
            ))}
          </ul>

          <div className="view-controls">
            <h3>Вид отображения</h3>
            <div className="view-buttons">
              <button 
                className={viewMode === 'tree' ? 'active' : ''} 
                onClick={() => setViewMode('tree')}
              >
                Дерево
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
              >
                Список
              </button>
            </div>
          </div>

          <div className="edit-mode-control">
            <h3>Режим редактирования</h3>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={editMode} 
                onChange={toggleEditMode} 
              />
              <span className="slider round"></span>
            </label>
            <span className="mode-label">{editMode ? 'Включен' : 'Выключен'}</span>
          </div>

          <div className="export-controls">
            <h3>Экспорт</h3>
            <button className="export-button">Экспорт в PDF</button>
            <button className="export-button">Экспорт в Excel</button>
          </div>
        </aside>

        <section className="structure-visualization">
          {selectedOrgId ? (
            viewMode === 'tree' ? (
              <OrganizationTree 
                organizationId={selectedOrgId} 
                readOnly={!editMode}
              />
            ) : (
              <div className="list-view">
                <h2>Список сотрудников (в разработке)</h2>
                <p>Здесь будет отображаться структура в виде списка</p>
              </div>
            )
          ) : (
            <div className="select-organization">
              <h2>Выберите организацию</h2>
              <p>Пожалуйста, выберите организацию из списка слева для отображения структуры</p>
            </div>
          )}
        </section>
      </main>

      <footer className="structure-footer">
        <div className="copyright">
          &copy; {new Date().getFullYear()} OFS Global. Все права защищены.
        </div>
      </footer>
    </div>
  );
};

export default OrganizationStructurePage; 