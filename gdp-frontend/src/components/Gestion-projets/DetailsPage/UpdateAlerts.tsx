import { useState, useEffect } from "react";

interface UpdateAlertsProps {
  alerts: { tech: string; oldVersion: string; newVersion: string }[];
}

const UpdateAlerts = ({ alerts }: UpdateAlertsProps) => {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative w-full overflow-hidden"> 
      <div
        className={`p-4 bg-red-100 text-red-800 rounded-md mb-4 relative transition-transform duration-700 ease-out ${
          animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-red-600 hover:text-red-900"
        >
          ✖
        </button>
        <h3 className="font-semibold">🚀 Mises à jour disponibles :</h3>
        <ul className="list-disc pl-5">
          {alerts.map((alert, index) => (
            <li key={index}>
              <strong>{alert.tech}</strong> : Version actuelle{" "}
              <strong>{alert.oldVersion}</strong> → Nouvelle version{" "}
              <strong>{alert.newVersion}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UpdateAlerts;
