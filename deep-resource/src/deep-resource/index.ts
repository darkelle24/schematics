/* eslint-disable @typescript-eslint/no-unused-vars */
import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';

// Vous pouvez définir des options en fonction de votre `schema.json`
interface DeepResourceOptions {
  name: string;
  file: boolean; // Cette option détermine si un module de fichier doit être inclus
  // ...autres options...
}

export function deepResource(options: DeepResourceOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const rules: Rule[] = [
      // Créer les fichiers à partir des modèles dans le dossier `/files`
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings, // pour utiliser des fonctions comme 'dasherize', 'classify', etc.
            ...options, // appliquer les options fournies par l'utilisateur (ex. nom de la ressource)
          }),
          move('src'), // ou un autre répertoire cible, en fonction de la structure de votre projet
        ]),
      ),
      // Ajouter une règle pour manipuler le fichier tsconfig.json
      (tree: Tree) => {
        const tsConfigPath = '/tsconfig.json'; // chemin vers votre tsconfig.json
        const buffer = tree.read(tsConfigPath);

        if (!buffer) {
          _context.logger.error('Could not find tsconfig.json');
          return;
        }

        const tsConfig = JSON.parse(buffer.toString());
        const compilerOptions = tsConfig.compilerOptions;

        if (!compilerOptions.paths) {
          compilerOptions.paths = {};
        }

        // Générer le chemin en fonction du nom de la ressource.
        const resourcePath = `${options.name.toLowerCase()}`;
        const newPathKey = `@${options.name}/*`;
        const newPathValue = [`src/api/${resourcePath}/*`];
        compilerOptions.paths[newPathKey] = newPathValue;
        tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      },
      // Conditionnellement ajouter des fichiers ou des configurations supplémentaires en fonction de `options.file`
      (tree: Tree, _context: SchematicContext) => {
        if (options.file) {
          // Ici, vous pouvez ajouter la logique pour manipuler d'autres fichiers
          // ou configurer le module pour gérer les fichiers en fonction de `options.file`
          // Par exemple, ajouter des dépendances, créer des fichiers supplémentaires, etc.
        }
      },
    ];

    // Exécuter les règles en séquence
    return chain(rules)(tree, _context);
  };
}
