import { StrictMode } from 'react';
import './App.css';

import TestGridAdvancedFilter from './TestGridAdvancedFilter';
import TestGridColumnFilter from './TestGridColumnFilter';

function App() {

  // Tu si dopln token
  const jwtToken = "XXX";

  return (
    <>
      <StrictMode>
        <div style={{ width: '100%' }}>
          <div style={{ width: '100%' }}>
            <header style={{ marginBottom: '20px' }}>
              <h2 style={{ color: '#ff6600' }}>DMS be4fe - Prehľad revízií dokumentov - POCITA TOTAL COUNT</h2>
              <p style={{ color: '#555' }}>Dátový zdroj: FileNet API V2 via Server-Side Model - Advanced Filter</p>
            </header>
          </div>

          <div style={{ width: '100%' }}>
            <TestGridAdvancedFilter jwtToken={jwtToken} />
          </div>
          <div style={{ width: '100%' }}>
            <header style={{ marginBottom: '20px' }}>
              <h2 style={{ color: '#ff6600' }}>DMS be4fe - Prehľad revízií dokumentov - POCITA do 500 zaznamov </h2>
              <p style={{ color: '#555' }}>Dátový zdroj: FileNet API V2 via Server-Side Model - Column Filter</p>
            </header>
          </div>

          <div style={{ width: '100%' }}>
            <TestGridColumnFilter jwtToken={jwtToken} />
          </div>
        </div>
      </StrictMode>
    </>
  )
}

export default App
