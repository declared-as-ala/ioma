import { Injectable } from "@nestjs/common";
import type {
  BeforeAfterComparison,
  FollowUpCheckin,
  VisionObservations,
} from "@ioma/types";
import { AI_INDICATOR_KEYS, type AiIndicatorKey } from "@ioma/config";

@Injectable()
export class FollowUpService {
  createCheckin(day: number, data: Partial<FollowUpCheckin>): FollowUpCheckin {
    return {
      day,
      completedAt: new Date().toISOString(),
      comfortRating: data.comfortRating ?? 4,
      tightnessAfterCleansing: Boolean(data.tightnessAfterCleansing),
      irritationNoticed: Boolean(data.irritationNoticed),
      notes: data.notes,
    };
  }

  compareAnalyses(
    previous: { id: string; createdAt: Date; indicators: Record<AiIndicatorKey, number> },
    current: { id: string; createdAt: Date; indicators: Record<AiIndicatorKey, number> },
  ): BeforeAfterComparison {
    const prevDate = previous.createdAt ? new Date(previous.createdAt) : new Date();
    const currDate = current.createdAt ? new Date(current.createdAt) : new Date();
    const diffMs = currDate.getTime() - prevDate.getTime();
    const daySpan = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    const indicatorChanges = AI_INDICATOR_KEYS.map((key) => {
      const pScore = previous.indicators?.[key] ?? 50;
      const cScore = current.indicators?.[key] ?? 50;
      const diff = cScore - pScore;

      // In cosmetic indicators, higher is better for hydration/radiance/firmness/texture, lower is better for redness/pores/lines/spots
      const higherIsBetter = ["hydration", "radiance", "firmness", "texture"].includes(
        key,
      );
      let trend: "improved" | "stable" | "needs_attention" = "stable";

      if (higherIsBetter) {
        if (diff >= 5) trend = "improved";
        else if (diff <= -5) trend = "needs_attention";
      } else {
        if (diff <= -5) trend = "improved";
        else if (diff >= 5) trend = "needs_attention";
      }

      return {
        key,
        previousScore: pScore,
        currentScore: cScore,
        diff,
        trend,
      };
    });

    const hydraChange = indicatorChanges.find((i) => i.key === "hydration");
    const hydraImproved = hydraChange && hydraChange.diff > 0;

    const narrative = {
      en: hydraImproved
        ? `Over ${daySpan} days of your personalized ritual, your cutaneous hydration appearance has shown visible progress, with reinforced barrier stability under daily air conditioning.`
        : `Comparing your consultations over ${daySpan} days, your skin has maintained stable baseline markers. Continued consistency with your daily morning hydration and evening recovery is recommended.`,
      fr: hydraImproved
        ? `Sur ${daySpan} jours de rituel personnalisé, l'apparence de votre hydratation cutanée montre une évolution positive, avec une stabilité renforcée de la barrière sous climatisation.`
        : `En comparant vos consultations sur ${daySpan} jours, votre peau a maintenu des marqueurs équilibrés. La régularité de votre rituel reste la clé pour optimiser votre confort.`,
      ar: hydraImproved
        ? `خلال ${daySpan} يومًا من اتباع روتينك المخصص، أظهر مظهر ترطيب بشرتك تحسنًا ملحوظًا مع زيادة استقرار حاجز الحماية تحت ظروف التكييف اليومية.`
        : `بمقارنة استشاراتك خلال ${daySpan} يومًا، حافظت بشرتك على مؤشرات متوازنة ومستقرة. يُوصى بالاستمرار المنتظم على الروتين الصباحي والمسائي للحفاظ على النضارة.`,
    };

    return {
      previousId: previous.id,
      previousDate: prevDate.toISOString(),
      currentId: current.id,
      currentDate: currDate.toISOString(),
      daySpan,
      indicatorChanges,
      narrative,
    };
  }
}
