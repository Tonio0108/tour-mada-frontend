import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TourCard from './TourCard';
import { MemoryRouter } from 'react-router';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      if (key === 'tour.days_plural') return 'jours';
      if (key === 'tour.days') return 'jour';
      if (key === 'tour.learn_more') return 'En savoir plus';
      return key;
    },
  }),
}));

describe('TourCard', () => {
  const mockProps = {
    title: 'Tour de Test',
    imageUrl: 'test.jpg',
    navigateTo: '/tour/1',
    duration: 5,
    price: 100,
  };

  it('renders tour information correctly', () => {
    render(
      <MemoryRouter>
        <TourCard {...mockProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Tour de Test')).toBeInTheDocument();
    expect(screen.getByText('5 jours')).toBeInTheDocument();
    expect(screen.getByText('100 €')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tour/1');
    expect(screen.getByText('En savoir plus')).toBeInTheDocument();
  });

  it('renders single day correctly', () => {
    render(
      <MemoryRouter>
        <TourCard {...mockProps} duration={1} />
      </MemoryRouter>
    );

    expect(screen.getByText('1 jour')).toBeInTheDocument();
  });
});
