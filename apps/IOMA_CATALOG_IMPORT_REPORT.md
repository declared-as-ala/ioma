# Official IOMA Paris UAE Product Catalogue Import Report

**Generated**: 2026-08-22T15:14:19.081Z  
**Environment**: Production / Staging  
**Database**: MongoDB (`mongodb://localhost:27017/ioma`)  
**Currency**: AED (United Arab Emirates Dirham)

---

## 1. Executive Summary

- **Total Official Pages / Products Discovered**: 63
- **Authoritative UAE Price Entries**: 53
- **Products Successfully Imported**: 49
- **Variants Successfully Created/Updated**: 52
- **Official Products with UAE Price PENDING**: 14
- **Review Required Price List Items**: 1 (`Masque Anti-Rides — 50 ml — 206 AED`)
- **Images Downloaded & Stored**: 163

---

## 2. Range & Category Taxonomy

| Range Code | Official Range Name     | Color Charter | Imported Products Count        |
| :--------- | :---------------------- | :------------ | :----------------------------- |
| `inlab`    | Soins Sur Mesure In.Lab | `#AA9FEB`     | 4 (8 commercial size variants) |
| `hydra`    | 1 Hydra                 | `#00639A`     | 6                              |
| `energize` | 2 Energize              | `#E56953`     | 5                              |
| `renew`    | 3 Renew                 | `#782285`     | 11                             |
| `calm`     | 4 Calm                  | `#B52655`     | 2                              |
| `purete`   | 5 Pureté                | `#B89E16`     | 4                              |
| `matte`    | 6 Matte                 | `#00677F`     | 1                              |
| `illumine` | 7 Illumine              | `#483A8F`     | 5                              |
| `coco`     | Soins Corps             | `#8D7B68`     | 3                              |
| `hair`     | Soins Cheveux           | `#2C5E7A`     | 7                              |

---

## 3. Authoritative UAE Selling Prices (AED)

Every purchasable product has been configured strictly with the exact supplied AED retail price. No currency conversions or estimates were used.

### In.Lab Personalized Skincare

- **Ma Crème Jour**: 30 ml — **559 AED** | 50 ml — **937 AED**
- **Ma Crème Nuit**: 30 ml — **559 AED** | 50 ml — **937 AED**
- **Mon Sérum**: 30 ml — **873 AED**
- **Mon Soin Yeux**: 30 ml — **508 AED**

### Facial Ranges

- **Gel Fraîcheur Hydratant**: 50 ml — **220 AED**
- **Sérum Hydratant Optimum**: 15 ml — **421 AED**
- **Crème Apaisante Jour et Nuit**: 30 ml — **432 AED**
- **Soft Peeling**: 50 ml — **248 AED**
- **Émulsion Exfoliante Douce**: 50 ml — **201 AED**
- **Mousse Tonique Astringente**: 150 ml — **191 AED**
- **Gel Réparateur Jour et Nuit**: 30 ml — **338 AED**
- **Masque Absorbant**: 50 ml — **251 AED**
- **Crème Hydratation Jeunesse**: 30 ml — **334 AED**
- **Vitality Shot**: 30 ml — **362 AED**
- **Soin Teinté Éclat Parfait (CC Gel)**: 30 ml — **220 AED**
- **Concentré Contour des Yeux J.E**: 15 ml — **362 AED**
- **Vitality Sleeping Mask**: 50 ml — **323 AED**
- **Crème Régulatrice Matifiante**: 30 ml — **303 AED**
- **Cell Protector SPF50+ PA++++**: 30 ml — **321 AED**
- **Bright Pearl Essence**: 40 ml — **698 AED**
- **Élixir Anti-Taches**: 10 ml — **303 AED**
- **Nettoyant Exfoliant Lumière**: 150 ml — **281 AED**
- **Eau de Soin Lumière**: 150 ml — **281 AED**
- **Tonique Doux (Mousse Tonique Douce)**: 150 ml — **193 AED**
- **Crème Généreuse Jour**: 30 ml — **464 AED**
- **Crème Généreuse Nuit**: 30 ml — **464 AED**
- **Sérum Généreux Extrême**: 15 ml — **536 AED**
- **Crème Généreuse Contour des Yeux**: 15 ml — **364 AED**
- **Lip Lift**: 15 ml — **346 AED**
- **Crème Sublime Revitalisante**: 50 ml — **968 AED**
- **Lift Contours**: 50 ml — **576 AED**
- **Booster Jeunesse (Flacon 50 ml)**: 50 ml — **942 AED**
- **Booster Jeunesse Pot**: 50 g — **942 AED**
- **Sublime Oil**: 30 ml — **983 AED**
- **Masque Sublime Revitalisant**: 50 ml — **382 AED**
- **Sérum Intensif Resurfaçant**: 15 ml — **337 AED**

### Body & Haircare

- **Genius Balm**: 50 ml — **112 AED**
- **Voile Exfoliant Douceur**: 150 ml — **228 AED**
- **Crème Voluptueuse Corps**: 150 ml — **241 AED**
- **Shampoing Soin Purifiant**: 200 ml — **155 AED**
- **Shampoing Soin Hydra Anti-Casse**: 200 ml — **155 AED**
- **Après-Shampoing Hydra Fond**: 200 ml — **236 AED**
- **Après-Shampoing Volumy Fond**: 200 ml — **155 AED**
- **Après-Shampoing Renew**: 200 ml — **155 AED**
- **Masque en Baume Repair**: 200 ml — **155 AED**
- **Sérum Essence Hydra**: 70 ml — **260 AED**

---

## 4. Pending & Review Required Items

1. **`Masque Anti-Rides — 50 ml — 206 AED`**: Not listed on the official French storefront. Kept in `REVIEW_REQUIRED` status for client review.
2. **Official Bundles & Routine Sets**: Imported with `uaeAvailability = "PENDING"` and `status = "draft"` until AED bundle prices are approved.

---

## 5. Media & Storage Architecture

- Official high-resolution 2000x2000px packaging and texture images were extracted.
- Synced to MinIO bucket `ioma-public`.
- Local high-speed web mirrors saved to `apps/web/public/images/products/`.
