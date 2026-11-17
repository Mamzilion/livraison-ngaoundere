import { GUARANTEE, WEIGHT } from "./pricing";

// Conditions de service Babana. Modifier TERMS_VERSION à chaque changement important :
// les commerçants devront alors accepter la nouvelle version.
export const TERMS_VERSION = "2026-11-17";

const f = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ");

/** L'essentiel, affiché à l'inscription. */
export const TERMS_SUMMARY = [
  `Babana est responsable du colis de la récupération jusqu'à la remise au client.`,
  `Sans valeur déclarée, un colis perdu ou abîmé par notre faute est remboursé à sa valeur réelle, jusqu'à ${f(GUARANTEE.baseCap)} FCFA.`,
  `Pour un article de plus grande valeur, déclarez sa valeur (jusqu'à ${f(GUARANTEE.maxDeclared)} FCFA) : il est couvert en totalité pour ${GUARANTEE.rate * 100} % de sa valeur.`,
  `L'emballage est à votre charge : un article fragile doit être signalé et bien protégé.`,
  `Toute réclamation se fait dans les 24 h après la livraison, avec des photos.`,
];

export const TERMS_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "1. Le service",
    items: [
      "Babana livre, pour le compte des commerces inscrits, des colis à leurs clients à Ngaoundéré et dans sa périphérie, avec ses livreurs à moto.",
      "Le prix de chaque course est calculé par la plateforme selon la distance par la route, le poids du colis et l'heure. Il est affiché avant que le livreur ne parte.",
    ],
  },
  {
    title: "2. Les engagements du commerçant",
    items: [
      "Donner des informations exactes : nom et numéro du client, contenu du colis, poids estimé et montant à encaisser.",
      "Remettre un colis fermé et emballé de façon adaptée à un transport à moto. Un article fragile (verre, écran, électronique, liquide) doit être signalé dans la description et protégé en conséquence.",
      `Respecter la limite de poids : jusqu'à ${WEIGHT.includedKg} kg, le poids est compris dans le prix ; de ${WEIGHT.includedKg} à ${WEIGHT.maxKg} kg, chaque kilo supplémentaire est facturé ${WEIGHT.perKg} FCFA ; au-delà de ${WEIGHT.maxKg} kg, la course n'est pas acceptée à moto.`,
      "Ne pas confier d'objets interdits : argent liquide (en dehors du montant à encaisser), produits illégaux, armes, produits explosifs ou inflammables (sauf bouteille de gaz domestique fermée et en bon état), animaux vivants.",
    ],
  },
  {
    title: "3. La responsabilité de Babana",
    items: [
      "Babana est responsable du colis à partir du moment où le livreur le récupère (statut « Colis récupéré ») jusqu'à sa remise au client (statut « Livrée »).",
      "Babana est responsable de l'argent encaissé par ses livreurs. Il est reversé au commerçant chaque soir, déduction faite du prix des courses.",
    ],
  },
  {
    title: "4. Indemnisation en cas de perte ou de dommage",
    items: [
      `Sans valeur déclarée : en cas de perte, de vol ou de dommage survenu pendant la livraison, Babana rembourse la valeur réelle de l'article (prix d'achat ou de vente justifié), dans la limite de ${f(GUARANTEE.baseCap)} FCFA par colis, ainsi que le prix de la course.`,
      `Avec valeur déclarée : le commerçant peut déclarer la valeur d'un colis, jusqu'à ${f(GUARANTEE.maxDeclared)} FCFA. Il paie alors une contribution de ${GUARANTEE.rate * 100} % de cette valeur (minimum ${GUARANTEE.minFee} FCFA), et l'article est couvert jusqu'à la valeur déclarée, sur justificatif.`,
      "L'indemnisation ne dépasse jamais la valeur réelle de l'article. Les pertes indirectes (vente perdue, bénéfice manqué) ne sont pas couvertes.",
      "En cas de dommage partiel, Babana rembourse le coût de la réparation, ou la perte de valeur, dans les mêmes limites.",
    ],
  },
  {
    title: "5. Cas non couverts",
    items: [
      "Emballage insuffisant ou inadapté, ou article fragile non signalé.",
      "Contenu différent de la description donnée, ou objet interdit.",
      "Détérioration naturelle de produits périssables, sauf retard causé par Babana.",
      "Dommage signalé après la remise sans réserve au livreur, ou réclamation hors délai.",
      "Événements exceptionnels indépendants de Babana (émeutes, catastrophes naturelles, décision des autorités).",
    ],
  },
  {
    title: "6. À la livraison et en cas de réclamation",
    items: [
      "Le client vérifie l'état du colis devant le livreur. Si le colis est visiblement abîmé, il peut le refuser ou le signaler tout de suite au livreur, photos à l'appui.",
      "Le commerçant fait sa réclamation dans les 24 heures qui suivent la livraison (48 heures en cas de colis non livré), auprès de Babana sur WhatsApp, avec le code de la course, des photos et une preuve de la valeur (facture, reçu, capture de la vente).",
      "Babana répond dans les 72 heures. L'indemnisation acceptée est versée par Mobile Money ou Orange Money, ou ajoutée au reversement suivant.",
    ],
  },
  {
    title: "7. Courses non abouties",
    items: [
      "Si le client est absent, injoignable ou refuse le colis, le colis est rapporté au commerçant et le déplacement est facturé au prix de la course.",
      "Une course annulée avant la récupération du colis n'est pas facturée.",
    ],
  },
  {
    title: "8. Modification des conditions",
    items: [
      "Babana peut faire évoluer ces conditions. Les commerçants sont prévenus et doivent accepter la nouvelle version pour continuer à créer des courses.",
    ],
  },
];
