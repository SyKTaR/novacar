# IndexNow — prévenir Bing (et Yandex, Seznam, Naver) d'une mise à jour

IndexNow permet de signaler à Bing qu'une page a été créée ou modifiée, sans attendre son passage. Google n'utilise pas IndexNow : pour Google, c'est le sitemap déclaré dans Search Console.

## Ce qui est en place

- Clé : `public/3fdfa477a809a8f1598a6c2cc1d2c17f.txt`, servie à `https://www.nova-car.fr/3fdfa477a809a8f1598a6c2cc1d2c17f.txt`. Le fichier contient exactement la clé, rien d'autre. Ne pas le renommer ni le supprimer, sinon les soumissions sont refusées (HTTP 403).
- Script : `scripts/indexnow.mjs`. Il lit les URL dans `dist/sitemap.xml` (après un build) ou, à défaut, dans le sitemap de production.

## Quand soumettre

Uniquement **après** un déploiement en production, pour les pages dont le contenu a changé (titre, texte, tarifs). Inutile après une modification purement visuelle. Pas de soumission en boucle : une fois par mise en ligne suffit.

## Comment

1. Vérifier que la clé est en ligne : `curl https://www.nova-car.fr/3fdfa477a809a8f1598a6c2cc1d2c17f.txt` doit renvoyer la clé.
2. Aperçu sans envoi : `node scripts/indexnow.mjs`
3. Envoi de tout le sitemap : `node scripts/indexnow.mjs --send`
   ou de quelques pages seulement : `node scripts/indexnow.mjs --send /renovation-jantes /`

Réponses : `200` ou `202` = reçu ; `403` = clé introuvable sur le site ; `422` = URL hors du domaine `www.nova-car.fr` ; `429` = trop de requêtes.

Dans Bing Webmaster Tools, les URL reçues apparaissent dans « IndexNow » quelques minutes à quelques heures après l'envoi.
