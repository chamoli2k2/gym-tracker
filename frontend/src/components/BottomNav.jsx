import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { to: '/', icon: '🏋️', label: 'Train' },
  { to: '/plans', icon: '📁', label: 'Plans' },
  { to: '/calendar', icon: '📅', label: 'Cal' },
  { to: '/timer', icon: '⏱️', label: 'Timer' },
  { to: '/analytics', icon: '📊', label: 'Stats' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
