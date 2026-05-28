import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";

export function FitnessStatCard({ eyebrow, title, description, accent = "#2563eb" }) {
  return (
    <FoundationCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      accent={accent}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.96) 55%, rgba(240,253,250,0.9) 100%)",
        border: "1px solid rgba(148, 163, 184, 0.16)",
        boxShadow: "0 18px 32px rgba(15, 23, 42, 0.05)"
      }}
    />
  );
}

export default FitnessStatCard;
