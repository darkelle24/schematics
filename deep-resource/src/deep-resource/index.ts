import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  template,
  move,
  chain,
  MergeStrategy,
  mergeWith,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

// Vous pouvez recevoir des options de la ligne de commande qui peuvent être définies dans un modèle d'interface
export interface MySchematicOptions {
  name: string;
  path: string;
  file: boolean;
}

function updateTsConfig(options: MySchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsConfigPath = '/tsconfig.json'; // chemin vers votre fichier tsconfig.json
    const buffer = tree.read(tsConfigPath); // lire le fichier tsconfig.json

    if (!buffer) {
      _context.logger.error('Could not find tsconfig.json');
      return;
    }

    // Transformer le fichier en JSON
    const tsConfigContent = buffer.toString();
    const tsConfig = JSON.parse(tsConfigContent);

    // Définir le nouveau chemin
    const newKey = `@${strings.capitalize(options.name)}/*`; // Par exemple, "@Example/*"
    const newValue = [`src/${strings.dasherize(options.path)}/*`];

    // Ajouter le nouveau chemin au tsconfig
    if (!tsConfig.compilerOptions.paths) {
      tsConfig.compilerOptions.paths = {};
    }
    tsConfig.compilerOptions.paths[newKey] = newValue;

    // Réécrire le fichier tsconfig.json
    tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));

    return tree;
  };
}

export function deepResource(options: MySchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(
      url('./files'), // chemin vers vos fichiers de modèle
      [
        template({
          ...strings, // utilise des helpers comme `dasherize`
          ...options,
        }),
        move(`src/${strings.dasherize(options.path)}/${strings.dasherize(options.name)}`),
      ]
    );

    // Cette règle fusionne le Tree du template avec le Tree de destination
    const rule = mergeWith(templateSource, MergeStrategy.Default);
    return chain([rule, updateTsConfig(options)])(tree, _context);
  };
}
