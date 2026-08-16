// Sprint 3 seed editorial content — genuine, informational skincare
// writing (not fabricated IOMA-specific claims or clinical stats), pending
// the real CMS/Article backend (Sprint 9, see DATA_MODEL.md "Article").
// Structured so migrating to real API-backed content is a data swap, not a
// rewrite — see CLAUDE.md "Rules Against Placeholders".
import type { Locale } from "@ioma/config";

export interface JournalArticle {
  slug: string;
  kicker: Record<Locale, string>;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string[]>;
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "dubai-summer-barrier-routine",
    kicker: { en: "Climate & Skin", fr: "Climat & Peau", ar: "المناخ والبشرة" },
    title: {
      en: "Why a Dubai summer changes your barrier routine",
      fr: "Pourquoi un été à Dubaï change votre routine barrière",
      ar: "لماذا يغيّر صيف دبي روتين حاجز بشرتكِ",
    },
    excerpt: {
      en: "Outdoor heat and indoor air conditioning pull your skin barrier in two directions at once. Here's what that actually means for your routine.",
      fr: "La chaleur extérieure et la climatisation intérieure tirent la barrière cutanée dans deux directions opposées. Voici ce que cela change concrètement pour votre routine.",
      ar: "تشد الحرارة الخارجية وتكييف الهواء الداخلي حاجز بشرتكِ في اتجاهين متعاكسين. إليكِ ما يعنيه ذلك فعلاً لروتينكِ.",
    },
    body: {
      en: [
        "A Dubai summer puts skin through two opposing climates in the same day: intense heat and humidity outdoors, and cold, moisture-stripping air conditioning indoors. Each stresses the skin barrier differently — heat increases oil production and sweat loss, while dry AC air pulls moisture straight out of the skin's surface.",
        "The result is a common but confusing pattern: skin that feels oily by midday yet tight or dehydrated by evening. Treating only one side of that equation — heavier creams to compensate for the AC, or stripping cleansers to manage the heat — usually makes the other problem worse.",
        "A more effective approach separates the two jobs. During the day, lightweight, humidity-resistant hydration and consistent SPF protect against heat and UV without adding heaviness. In the evening, once the day's environmental stress is over, a richer barrier-support step replenishes what air conditioning removed.",
        "This is exactly the kind of context a proper diagnosis accounts for — not just skin type, but the environment that skin actually lives in day to day.",
      ],
      fr: [
        "Un été à Dubaï fait traverser à la peau deux climats opposés en une seule journée : une chaleur et une humidité intenses à l'extérieur, et une climatisation froide et asséchante à l'intérieur. Chacun agresse la barrière cutanée différemment — la chaleur augmente la production de sébum et la perte par transpiration, tandis que l'air sec de la climatisation extrait directement l'humidité de la surface de la peau.",
        "Le résultat est un schéma courant mais déroutant : une peau qui semble grasse en milieu de journée mais tiraillée ou déshydratée le soir. Ne traiter qu'un seul côté de cette équation — des crèmes plus riches pour compenser la climatisation, ou des nettoyants trop décapants pour gérer la chaleur — aggrave généralement l'autre problème.",
        "Une approche plus efficace sépare les deux missions. Le jour, une hydratation légère et résistante à l'humidité, associée à une protection solaire constante, protège de la chaleur et des UV sans alourdir la peau. Le soir, une fois le stress environnemental de la journée passé, une étape de soin plus riche reconstitue ce que la climatisation a retiré.",
        "C'est précisément ce type de contexte qu'un diagnostic bien mené prend en compte — non seulement le type de peau, mais l'environnement dans lequel cette peau évolue réellement au quotidien.",
      ],
      ar: [
        "يُخضع صيف دبي البشرة لمناخين متعاكسين في اليوم ذاته: حرارة ورطوبة شديدتان في الخارج، وتكييف هواء بارد ومُجفِّف في الداخل. يُجهد كل منهما حاجز البشرة بطريقة مختلفة — إذ تزيد الحرارة إفراز الزيت وفقدان الرطوبة عبر التعرق، بينما يسحب هواء التكييف الجاف الرطوبة مباشرة من سطح البشرة.",
        "النتيجة نمط شائع لكن محيّر: بشرة تبدو دهنية في منتصف النهار لكنها مشدودة أو جافة مساءً. الاكتفاء بمعالجة جانب واحد فقط من هذه المعادلة — كريمات أثقل لتعويض التكييف، أو منظفات قاسية لمواجهة الحرارة — يزيد عادةً المشكلة الأخرى سوءاً.",
        "النهج الأكثر فعالية يفصل بين المهمتين. خلال النهار، يحمي ترطيب خفيف مقاوم للرطوبة مع حماية شمسية ثابتة من الحرارة والأشعة فوق البنفسجية دون إثقال البشرة. مساءً، بعد انتهاء الإجهاد البيئي لليوم، تعيد خطوة عناية أغنى ما أزاله التكييف.",
        "هذا بالضبط نوع السياق الذي يراعيه التشخيص السليم — ليس فقط نوع البشرة، بل البيئة التي تعيشها هذه البشرة فعلياً يوماً بعد يوم.",
      ],
    },
  },
  {
    slug: "reading-a-diagnosis",
    kicker: { en: "Diagnosis", fr: "Diagnostic", ar: "التشخيص" },
    title: {
      en: "Reading a diagnosis: what the numbers actually mean",
      fr: "Lire un diagnostic : ce que les chiffres signifient vraiment",
      ar: "قراءة التشخيص: ماذا تعني الأرقام فعلاً",
    },
    excerpt: {
      en: "A hydration or firmness score isn't a grade — it's a starting point. Here's how to actually read one.",
      fr: "Un score d'hydratation ou de fermeté n'est pas une note — c'est un point de départ. Voici comment le lire réellement.",
      ar: "درجة الترطيب أو الشد ليست تقييماً — بل نقطة انطلاق. إليكِ كيفية قراءتها فعلياً.",
    },
    body: {
      en: [
        "It's tempting to treat a skin diagnosis score like a school grade — higher is better, lower needs fixing. That framing misses the point. A diagnosis isn't measuring how good your skin is; it's measuring where it currently stands on a handful of specific indicators, so a routine can be built around what's actually true today.",
        "A single hydration or radiance number, on its own, tells you very little. What matters is the pattern across indicators — a skin reading low on hydration but high on oil production needs a very different routine than one reading low on both — and how that pattern changes over repeated diagnoses.",
        "This is also why a one-time reading has real limits. Skin responds to season, stress, travel, and routine changes, sometimes within weeks. A diagnosis re-read after a few months of a routine tells you whether that routine is actually working — not just whether the first reading looked concerning.",
        "That's the real value of pairing a self-guided questionnaire or AI-assisted photo analysis with an in-institute confirmation: a second, professional read of the same skin, close enough in time to compare meaningfully.",
      ],
      fr: [
        "Il est tentant de traiter le score d'un diagnostic de peau comme une note scolaire — plus c'est élevé, mieux c'est ; plus c'est bas, il faut corriger. Cette lecture passe à côté de l'essentiel. Un diagnostic ne mesure pas à quel point votre peau est « bonne » ; il mesure où elle se situe actuellement sur quelques indicateurs précis, afin qu'une routine puisse être construite autour de ce qui est vrai aujourd'hui.",
        "Un seul chiffre d'hydratation ou d'éclat, pris isolément, en dit très peu. Ce qui compte, c'est le profil d'ensemble des indicateurs — une peau faible en hydratation mais forte en production de sébum a besoin d'une routine très différente d'une peau faible sur les deux — et la façon dont ce profil évolue au fil des diagnostics successifs.",
        "C'est aussi pourquoi une lecture ponctuelle a de réelles limites. La peau réagit à la saison, au stress, aux voyages et aux changements de routine, parfois en quelques semaines seulement. Un diagnostic relu après plusieurs mois de routine indique si celle-ci fonctionne réellement — pas seulement si la première lecture semblait préoccupante.",
        "C'est là toute la valeur d'associer un questionnaire autonome ou une analyse photo assistée par IA à une confirmation en institut : une seconde lecture professionnelle de la même peau, suffisamment rapprochée dans le temps pour être réellement comparable.",
      ],
      ar: [
        'من المغري التعامل مع نتيجة تشخيص البشرة وكأنها درجة مدرسية — كلما ارتفعت كان ذلك أفضل، وكلما انخفضت احتاجت إلى تصحيح. هذا الفهم يغفل الجوهر. التشخيص لا يقيس مدى "جودة" بشرتكِ، بل يحدد موقعها الحالي على عدد من المؤشرات الدقيقة، ليُبنى الروتين على ما هو صحيح اليوم فعلاً.',
        "رقم واحد للترطيب أو الإشراق، بمفرده، لا يخبركِ بالكثير. المهم هو النمط العام للمؤشرات مجتمعة — فبشرة منخفضة الترطيب ومرتفعة إفراز الزيت تحتاج روتيناً مختلفاً تماماً عن بشرة منخفضة في الاثنين معاً — وكيف يتغير هذا النمط عبر تشخيصات متكررة.",
        "لهذا أيضاً للقراءة الواحدة حدود حقيقية. تستجيب البشرة للموسم والتوتر والسفر وتغييرات الروتين، أحياناً خلال أسابيع قليلة. إعادة التشخيص بعد أشهر من اتباع روتين معين تُظهر ما إذا كان هذا الروتين يُجدي فعلاً — لا مجرد ما إذا بدت القراءة الأولى مقلقة.",
        "هذه هي القيمة الحقيقية للجمع بين استبيان ذاتي أو تحليل صور مدعوم بالذكاء الاصطناعي وتأكيد في المعهد: قراءة احترافية ثانية للبشرة نفسها، بفارق زمني كافٍ لمقارنة ذات معنى.",
      ],
    },
  },
];
