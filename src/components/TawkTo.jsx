import { useEffect } from "react";

function TawkTo() {
  useEffect(() => {
    var s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/690f7a8730b62c195b535cf9/1j9i7d90i"; // link của bạn
    s1.setAttribute("crossorigin", "*");

    document.body.appendChild(s1);
  }, []);

  return null; // không render gì
}

export default TawkTo;
