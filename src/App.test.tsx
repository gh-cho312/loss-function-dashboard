import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';
import { LanguageProvider } from './i18n/LanguageContext';

function renderApp() {
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
}

describe('App', () => {
  it('renders the sidebar and the first task without crashing', () => {
    renderApp();
    expect(screen.getByText('손실함수 대시보드')).toBeInTheDocument();
    // first task is classification; its heading uses the title
    expect(screen.getAllByText(/Classification|분류/).length).toBeGreaterThan(0);
  });

  it('switches tasks when a sidebar item is clicked', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /세그멘테이션/ }));
    expect(screen.getAllByText(/Dice/).length).toBeGreaterThan(0);
  });

  it('expands a loss card to reveal details', () => {
    renderApp();
    const firstExpand = screen.getAllByRole('button', { name: '자세히 보기' })[0];
    fireEvent.click(firstExpand);
    expect(screen.getByText('직관')).toBeInTheDocument();
  });
});
