import React from "react";

export function LandingPage({ enterApp }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", padding: "28px 56px 60px", background: "#020711", color: "#eef6ff", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 76% 18%, rgba(0,136,255,.32), transparent 30%), radial-gradient(circle at 64% 52%, rgba(0,216,255,.18), transparent 18%), linear-gradient(90deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.46) 43%, rgba(0,0,0,.26) 100%)" }} />
      <div style={{ position: "absolute", left: "43%", right: "-2%", top: 80, height: 560, opacity: .98 }}>
        <div style={{ position: "absolute", left: "0%", right: "0%", bottom: 100, height: 2, background: "linear-gradient(90deg, transparent, #008cff 18%, #00d8ff 48%, #008cff 76%, transparent)", boxShadow: "0 0 32px rgba(0,216,255,1)" }} />
        <div style={{ position: "absolute", left: "4%", right: "0%", bottom: -18, height: 210, background: "repeating-linear-gradient(90deg, rgba(0,136,255,.32) 0, rgba(0,136,255,.32) 1px, transparent 1px, transparent 44px), repeating-linear-gradient(0deg, rgba(0,136,255,.23) 0, rgba(0,136,255,.23) 1px, transparent 1px, transparent 22px)", transform: "perspective(760px) rotateX(62deg)", transformOrigin: "bottom", opacity: .7 }} />
        {["2%","8%","15%","21%","74%","80%","87%","94%"].map((left, i) => (
          <div key={left} style={{ position: "absolute", left, bottom: 101, width: [18,28,20,34,28,36,22,26][i], height: [95,190,135,250,180,290,150,205][i], border: "1px solid rgba(0,174,255,.48)", background: "linear-gradient(180deg, rgba(0,174,255,.16), rgba(0,12,26,.5))", boxShadow: "0 0 28px rgba(0,136,255,.24)" }}>
            <div style={{ height: "100%", background: "repeating-linear-gradient(180deg, transparent 0, transparent 15px, rgba(0,216,255,.46) 16px)" }} />
          </div>
        ))}
        <div style={{ position: "absolute", left: "12%", top: 8, fontSize: 330, fontWeight: 950, fontStyle: "italic", letterSpacing: -28, lineHeight: .8, background: "linear-gradient(135deg,#ffffff 0%,#b8d8ff 12%,#101927 28%,#0b1826 38%,#0077ff 56%,#00d8ff 78%,#ffffff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 0 28px rgba(0,140,255,.65), 0 0 90px rgba(0,217,255,.28)", filter: "drop-shadow(0 0 22px rgba(0,162,255,.75))", transform: "skewX(-13deg)" }}>FF</div>
        <div style={{ position: "absolute", left: "25%", top: 52, width: 460, height: 4, background: "linear-gradient(90deg,#ffffff,#00d8ff,#0077ff)", boxShadow: "0 0 28px rgba(0,216,255,1)", transform: "rotate(-13deg)" }} />
        <div style={{ position: "absolute", left: "29%", top: 265, width: 438, height: 4, background: "linear-gradient(90deg,#ffffff,#00d8ff,#0077ff)", boxShadow: "0 0 28px rgba(0,216,255,1)", transform: "rotate(-13deg)" }} />
        <div style={{ position: "absolute", left: "26%", top: 374, width: 430, height: 4, background: "linear-gradient(90deg,#ffffff,#00aaff,transparent)", boxShadow: "0 0 18px rgba(0,136,255,.9)", transform: "rotate(-13deg)" }} />
        <div style={{ position: "absolute", left: "35%", top: 354, width: 350, height: 78, borderTop: "5px solid #eaf6ff", borderRight: "5px solid #eaf6ff", transform: "skewX(-24deg)", filter: "drop-shadow(0 0 15px rgba(0,174,255,.9))" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <nav style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", alignItems: "center", marginBottom: 132 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, textTransform: "uppercase" }}>
            <div style={{ fontSize: 46, fontWeight: 950, fontStyle: "italic", letterSpacing: -4, background: "linear-gradient(135deg,#fff,#008cff,#00d8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 12px rgba(0,136,255,.8))", transform: "skewX(-12deg)" }}>FF</div>
            <div style={{ letterSpacing: 5, lineHeight: 1.08 }}>
              <div style={{ color: "#f4f8ff", fontSize: 15, fontWeight: 900 }}>Forward</div>
              <div style={{ color: "#00aaff", fontSize: 15, fontWeight: 900 }}>Freedom</div>
              <div style={{ color: "#f4f8ff", fontSize: 15, fontWeight: 900 }}>Financial</div>
              </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 46, color: "#f5f7fb", fontSize: 15, fontWeight: 800, letterSpacing: .6, textTransform: "uppercase" }}>
            <span style={{ color: "white", borderBottom: "2px solid #00aaff", paddingBottom: 18 }}>Home</span>
            <span>About</span>
            <span>Services</span>
            <span>Strategy</span>
            <span>Resources</span>
            <span>Contact</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 28 }}>
            <button onClick={enterApp} style={{ color: "white", background: "rgba(2,12,27,.62)", border: "1px solid #00b7ff", borderRadius: 7, padding: "14px 22px", boxShadow: "0 0 22px rgba(0,136,255,.22)", cursor: "pointer", fontWeight: 900, fontSize: 15, textTransform: "uppercase" }}>Client Login</button>
            <span style={{ color: "#cfe7ff", fontSize: 30 }}>☰</span>
          </div>
        </nav>

        <section style={{ maxWidth: 650, marginBottom: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, color: "#00aaff", fontSize: 36, fontWeight: 900, letterSpacing: 10, textTransform: "uppercase", marginBottom: 24, textShadow: "0 0 24px rgba(0,170,255,.55)" }}>
            Forward Freedom Financial <span style={{ width: 180, height: 1, background: "linear-gradient(90deg,#00aaff,transparent)" }} />
          </div>
          
          <p style={{ color: "#f0f4fb", fontSize: 20, lineHeight: 1.65, maxWidth: 560, margin: "28px 0 38px" }}>
            Forward Freedom Financial is built to help you take control of today, build wealth for tomorrow, and create the freedom to live life on your terms.
          </p>
          <div style={{ display: "flex", gap: 64 }}>
            <button onClick={enterApp} style={{ color: "white", background: "linear-gradient(90deg,#0077ff,#008cff)", border: "1px solid rgba(125,220,255,.55)", borderRadius: 8, padding: "17px 34px", boxShadow: "0 0 34px rgba(0,136,255,.48)", cursor: "pointer", fontWeight: 900, fontSize: 16, textTransform: "uppercase", letterSpacing: 1 }}>Build your Foundation <span style={{ marginLeft: 18, fontSize: 24 }}>→</span></button>
            <button style={{ color: "#f4f8ff", background: "rgba(2,16,34,.62)", border: "1px solid #00b7ff", borderRadius: 8, padding: "17px 34px", cursor: "pointer", fontWeight: 900, fontSize: 16, textTransform: "uppercase", letterSpacing: 1 }}>Our Strategy <span style={{ color: "#00b7ff", marginLeft: 18, fontSize: 24 }}>→</span></button>
          </div>
        </section>

        <section style={{ border: "1px solid rgba(0,136,255,.28)", background: "rgba(3,17,32,.68)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "30px 36px", gap: 24, boxShadow: "inset 0 0 42px rgba(0,70,150,.11)", marginBottom: 30 }}>
          {[
            ["◷", "Build Wealth", "Smart strategies for long-term growth."],
            ["▣", "Protect Future", "Secure what matters most to you."],
            ["$", "Create Income", "Passive income strategies that work for you."],
            ["⚑", "Live Freely", "Freedom isn’t a dream. It’s a plan."],
          ].map((item, index) => (
            <div key={item[1]} style={{ display: "flex", alignItems: "center", gap: 22, borderRight: index < 3 ? "1px solid rgba(0,136,255,.22)" : "none" }}>
              <div style={{ color: "#008cff", fontSize: 56, width: 80, textAlign: "center", textShadow: "0 0 22px rgba(0,136,255,.55)" }}>{item[0]}</div>
              <div>
                <div style={{ color: "white", fontWeight: 900, textTransform: "uppercase", fontSize: 17, marginBottom: 10 }}>{item[1]}</div>
                <div style={{ color: "#c6d2e1", fontSize: 16, lineHeight: 1.45 }}>{item[2]}</div>
              </div>
            </div>
          ))}
        </section>

        <section style={{ border: "1px solid rgba(0,136,255,.18)", background: "linear-gradient(90deg, rgba(3,17,32,.86), rgba(3,17,32,.45))", borderRadius: 10, padding: "24px 48px", display: "grid", gridTemplateColumns: ".7fr 1.7fr", gap: 34, overflow: "hidden", alignItems: "center" }}>
          <div>
            <div style={{ color: "#00aaff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 18 }}>Our Mission</div>
            <div style={{ color: "white", fontSize: 34, lineHeight: 1.22, fontWeight: 800 }}>Moving Forward With<br /><span style={{ color: "#008cff" }}>Financial Freedom</span></div>
          </div>
          <p style={{ color: "#d6e2f0", fontSize: 17, lineHeight: 1.8, margin: 0, alignSelf: "center" }}>Forward Freedom Financial exists to help people build unshakable financial foundations through discipline, wisdom, and courageous action rooted in Jesus Christ.<br /><br />We believe financial leadership requires a wartime mindset: scanning the battlefield, taking ownership, protecting and providing your family, and advancing with purpose no matter the economic battlefield.<br /><br />Our mission is to turn fear into strategy, debt into freedom, and money into a tool that empowers people to live boldly, give generously, and lead with conviction.</p>
        </section>
      </div>
    </div>
  );
}