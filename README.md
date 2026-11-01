# QLF SHOP — Chrome Edition + Backend Supabase

Boutique statique compatible GitHub Pages / Vercel, avec catalogue connecté à Supabase, enregistrement des commandes et espace administrateur privé.

## Contenu

- `index.html`, `style.css`, `script.js` : boutique Chrome.
- `admin.html`, `admin.css`, `admin.js` : tableau de bord privé (`/admin.html`).
- `backend-config.js` : identifiants publics de connexion Supabase à renseigner.
- `supabase-schema.sql` : tables, règles de sécurité (RLS), catalogue initial et rôle administrateur.

## Installation du backend (à faire une seule fois)

1. Crée un projet sur https://supabase.com et attends qu'il soit prêt.
2. Dans Supabase, ouvre **SQL Editor > New query**. Copie tout le contenu de `supabase-schema.sql`, puis clique sur **Run**.
3. Ouvre **Project Settings > API**. Copie le **Project URL** et la clé **anon / publishable** (jamais la clé `service_role`).
4. Ouvre `backend-config.js` et remplace les deux valeurs d'exemple :

   ```js
   window.QLF_CONFIG = {
     SUPABASE_URL: "https://TON-PROJET.supabase.co",
     SUPABASE_ANON_KEY: "TA_CLE_ANON_OU_PUBLISHABLE"
   };
   ```

5. Dans Supabase, ouvre **Authentication > Users > Add user** et crée ton compte administrateur avec ton propre email et un mot de passe fort. Désactive les inscriptions publiques dans **Authentication > Settings / Signups** (le libellé peut varier).
6. Dans **Authentication > Users**, copie l'UUID de ce compte. Dans **SQL Editor**, exécute la requête ci-dessous en remplaçant l'UUID :

   ```sql
   insert into public.user_roles (user_id, role)
   values ('UUID-DE-TON-COMPTE-ADMIN', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

7. Téléverse tout le contenu du dossier `qlf-shop-premium` sur ton hébergement (Vercel ou GitHub Pages). Garde tous les fichiers dans le même dossier.
8. Ouvre `https://TON-SITE/admin.html`, connecte-toi avec le compte créé à l'étape 5.

## Utilisation

- Les visiteurs voient les produits actifs dans la base Supabase.
- Une commande est enregistrée dans la table `orders` avec les coordonnées saisies et les articles du panier, puis le client peut confirmer sur WhatsApp.
- Depuis `/admin.html`, tu peux modifier les noms, collections, couleurs, prix, stocks, images et visibilité des produits.
- Le tableau de bord affiche les commandes et permet de changer leur statut.

## Sécurité importante

- La clé `anon` / `publishable` est prévue pour être utilisée dans le navigateur. Les règles RLS du SQL protègent les données.
- **Ne mets jamais la clé `service_role` dans `backend-config.js` ni dans un fichier public.**
- Seuls les comptes dont l'UUID est inscrit dans `user_roles` avec le rôle `admin` peuvent lire les commandes et gérer le catalogue.
- Les visiteurs peuvent seulement insérer une commande en attente ; ils ne peuvent pas lire les commandes.
- Ne partage pas ton mot de passe administrateur.

## Catalogue et photos

Les dix références initiales reprennent le catalogue intégré à la version précédente (deux collections, cinq couleurs chacune, prix initial de 55 DT). Les URL d'images reprennent les noms de fichiers prévus dans le site précédent. Si tes fichiers GitHub portent d'autres noms, remplace leurs URL dans l'admin.

## Important

Le ZIP contient le code complet et le SQL prêt à exécuter, mais il n'est pas encore relié à ton compte Supabase : il faut effectuer les étapes ci-dessus avec les identifiants de TON projet. Tant que `backend-config.js` contient les valeurs d'exemple, la boutique garde son catalogue local et l'admin affiche la configuration requise.
