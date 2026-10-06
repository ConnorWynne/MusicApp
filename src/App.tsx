import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>MusicApp</h1>
      </header>

      <main className="app-content">
        <section className="welcome">
          <p className="eyebrow">YOUR MUSIC. YOUR SERVERS.</p>
          <h2>Welcome to MusicApp</h2>
          <p>
            Connect your music server and listen to your library anywhere.
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <div className="mini-player">
          <div className="mini-player-info">
            <span className="mini-player-title">Nothing playing</span>
            <span className="mini-player-artist">
              Choose something from your library
            </span>
          </div>

          <button type="button" disabled aria-label="Play">
            ▶
          </button>
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          <button type="button">Home</button>
          <button type="button">Library</button>
          <button type="button">Search</button>
          <button type="button">Settings</button>
        </nav>
      </footer>
    </div>
  )
}

export default App