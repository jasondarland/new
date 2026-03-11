import { Link } from 'react-router-dom';

const items = ['Home', 'About', 'Products', 'Solutions', 'Support', 'Contact', 'Portal Login'];

export function NavBar() {
  return (
    <header className="topbar">
      <div className="container nav">
        <div className="brand">SSI</div>
        <nav>
          {items.map((item) => (
            <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}>
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
