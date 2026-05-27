import { StrictMode } from 'react';
import './App.css';

import TestGridAdvancedFilter from './TestGridAdvancedFilter';
import TestGridColumnFilter from './TestGridColumnFilter';

function App() {

  return (
    <>
      <StrictMode>
        <div>
          <div>
            <header style={{ marginBottom: '20px' }}>
              <h2 style={{ color: '#ff6600' }}>DMS be4fe - Prehľad revízií dokumentov</h2>
              <p style={{ color: '#555' }}>Dátový zdroj: FileNet API V2 via Server-Side Model - Advanced Filter</p>
            </header>
          </div>

          <div>
            <TestGridAdvancedFilter />
          </div>
          <div>
            <header style={{ marginBottom: '20px' }}>
              <h2 style={{ color: '#ff6600' }}>DMS be4fe - Prehľad revízií dokumentov</h2>
              <p style={{ color: '#555' }}>Dátový zdroj: FileNet API V2 via Server-Side Model - Column Filter</p>
            </header>
          </div>

          <div>
            <TestGridColumnFilter />
          </div>
        </div>
      </StrictMode>
    </>
  )
}

export default App
