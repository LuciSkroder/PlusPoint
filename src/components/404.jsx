import "../css/404.css";

export default function NotFound() {
  const handleRedirect = () => {
    window.location.href = "/";
  };

  return (
    <main className="konstruktion-main">
      <h1>Denne side er under konstruktion</h1>
      <p>
        Vi beklager, denne side er desværre ikke færdig endnu, du kan gå tilbage
        til forsiden,{" "}
        <button onClick={handleRedirect} className="not-found-button">
          her
        </button>
      </p>
    </main>
  );
}
