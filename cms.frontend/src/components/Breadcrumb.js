import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Breadcrumb.css';

export default function Breadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <div className="custom-breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.path ? (
            <button 
              onClick={() => navigate(item.path)} 
              className="breadcrumb-link"
            >
              {item.label}
            </button>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="breadcrumb-separator">›</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
