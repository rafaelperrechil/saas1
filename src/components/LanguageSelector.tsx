'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Menu, MenuItem, IconButton } from '@mui/material';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleMenuClose();
  };

  // Mapa de idiomas para arquivos de bandeiras e nomes
  const languages = {
    pt: { flag: '/images/flags/flag-br.png', name: 'Português' },
    en: { flag: '/images/flags/flag-uk.png', name: 'English' },
    es: { flag: '/images/flags/flag-es.png', name: 'Español' },
    fr: { flag: '/images/flags/flag-fr.png', name: 'Français' },
    de: { flag: '/images/flags/flag-de.png', name: 'Deutsch' },
    zh: { flag: '/images/flags/flag-cn.png', name: '中文' },
  };

  // Obter o idioma atual (ou padrão: pt)
  const currentLang = i18n.language || 'pt';
  const currentFlag = languages[currentLang as keyof typeof languages]?.flag || languages.pt.flag;

  return (
    <div>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: 0.5,
          border: `2px solid ${anchorEl ? '#9c27b0' : 'transparent'}`,
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        }}
      >
        <Image
          src={currentFlag}
          alt={`Idioma atual: ${languages[currentLang as keyof typeof languages]?.name || 'Português'}`}
          width={28}
          height={28}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {Object.entries(languages).map(([code, { flag, name }]) => (
          <MenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            selected={currentLang === code}
            sx={{
              minWidth: '150px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: currentLang === code ? 'rgba(156, 39, 176, 0.08)' : 'transparent',
            }}
          >
            <Image src={flag} alt={name} width={24} height={24} />
            <span>{name}</span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSelector;
